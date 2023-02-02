import {
	InsightFilter,
	InsightM,
	InsightQuery,
	LogicComparison,
	MComparison,
	MFields,
	Negation,
	SComparison,
	SFields,
	WildcardPosition
} from "./QueryUtil";
import {InsightError} from "./IInsightFacade";

export class QueryParser {
	private readonly inputJson: any;
	private id: string = ""; // this is just for the parser to keep track of so that it can instantiate the insightquery object with the right id
	constructor(input: any) {
		this.inputJson = input;
	}

	public getQuery(): Promise<InsightQuery> | any { // any is just a stub for now
		let ret = new Promise((resolve,reject) => {
			// first do basic structure check, if good, call helpers.
			if (Object.keys(this.inputJson).length === 2) {
				// check has WHERE key
				if (this.inputJson["WHERE"] !== undefined) {
					let whereClause = this.inputJson["WHERE"];
					// check no extra or missing keys in WHERE clause
					if (Object.keys(whereClause).length > 1) {
						reject(new InsightError("wrong number of keys in input->WHERE"));
					} else {
						let filter: InsightFilter | null;
						// after all the switch statements execute, if filter is still null, then we reject promise. if we have filter, use it to create InsiightQuery object
						let key = Object.keys(whereClause)[0];
						filter = this.multiplexInput(key, whereClause[key]);
						if (filter == null) {
							reject(new InsightError("a valid filter could not be parsed"));
						} else {
							// incomplete
							console.log(filter);
						}
					}
				} else {
					reject(new InsightError("input doesnt have key: WHERE"));
				}
				if (this.inputJson["OPTIONS"] !== undefined) {
					// console.log("options key exist");
				} else {
					reject(new InsightError("input doesnt have key: OPTIONS"));
				}
			} else {
				reject(new InsightError("wrong number of keys in input"));
			}
		});
	}

	private multiplexInput(key: string, json: any): InsightFilter | null {
		switch (key) {
			case "AND":
			case "OR":
				return this.logicHelper(key, json);
			case "LT":
				return this.MHelper(InsightM.lt, json);
			case "GT":
				return this.MHelper(InsightM.gt, json);
			case "EQ":
				return this.MHelper(InsightM.eq, json);
			case "IS":
				return this.SHelper(json);
			case "NOT":
				return this.NHelper(json);
			default:
				// unrecognized key
				console.log("unrecognized filter key: " + key);
				return null;
		}
	}

	// return a logicComparison or null if failed to parse
	private logicHelper(logic: string, json: []): LogicComparison | null {
		return null;
	}

	// return a MComparison or null if failed to parse
	private MHelper(math: InsightM, json: any): MComparison | null {
		// first check number of keys
		if (Object.keys(json).length > 1) {
			return null;
		}
		// then check if id and field is valid
		let idAndField = this.MgetIdandField(Object.keys(json)[0]);
		if (idAndField == null) {
			return null;
		} else {
			// get numeric target value
			let value = json[Object.keys(json)[0]];
			if (typeof value !== "number") {
				return null;
			}
			// create MComparison object
			return new MComparison(math, idAndField[1], value);
		}
	}

	// return a SComparison or null if failed to parse
	private SHelper(json: any): SComparison | null {
		// first check number of keys
		if (Object.keys(json).length > 1) {
			return null;
		}
		// then check if id and field is valid
		let idAndField = this.SgetIdandField(Object.keys(json)[0]);
		if (idAndField == null) {
			return null;
		} else {
			// get string target value and parse wildcard
			let valueAndWC = this.getSvalueAndWildCard(json[Object.keys(json)[0]]);
			if (valueAndWC == null) {
				return null;
			}
			// create MComparison object
			return new SComparison(idAndField[1], valueAndWC[0], valueAndWC[1]);
		}
	}

	// return a Negation or null if failed to parse
	private NHelper(json: any): Negation | null {
		if (json.length > 1) {
			console.log("too many filters in negation");
			return null;
		}
		// console.log(Object.keys(json)[0]);
		// console.log(json[Object.keys(json)[0]]);
		let filter = this.multiplexInput(Object.keys(json)[0], json[Object.keys(json)[0]]);
		if (filter == null) {
			console.log("a valid filter could not be parsed for negation");
			return null;
		} else {
			return new Negation(filter);
		}
	}

	// helper that takes a string, gets the id portion, and also the field portion. returns null if either is invalid
	private MgetIdandField(text: string): [string, MFields] | null {
		let firstUS: number = text.indexOf("_");
		let id = text.substring(0,firstUS);
		let fieldString: string = text.substring(firstUS + 1);
		switch (fieldString) {
			case "avg":
				return [id, MFields.avg];
			case "pass":
				return [id, MFields.pass];
			case "fail":
				return [id, MFields.fail];
			case "audit":
				return [id, MFields.audit];
			case "year":
				return [id, MFields.year];
			default:
				console.log("either id or field couldnt be parsed or is incorrect type");
				return null;
		}
	}
	private SgetIdandField(text: string): [string, SFields] | null {
		let firstUS: number = text.indexOf("_");
		let id = text.substring(0,firstUS);
		let fieldString: string = text.substring(firstUS + 1);
		switch (fieldString) {
			case "dept":
				return [id, SFields.dept];
			case "id":
				return [id, SFields.id];
			case "instructor":
				return [id, SFields.instructor];
			case "title":
				return [id, SFields.title];
			case "uuid":
				return [id, SFields.uuid];
			default:
				console.log("either id or field couldnt be parsed or is incorrect type");
				return null;
		}
	}

	private getSvalueAndWildCard (target: any): [WildcardPosition, string] | null {
		// screen for when input is not a string
		if (typeof target !== "string") {
			console.log("S target value is not string");
			return null;
		}
		// start with no WC
		let WC: WildcardPosition = WildcardPosition.none;
		let targetString: string = "";
		// check for *blah
		if (target.charAt(0) === "*") {
			WC = WildcardPosition.front;
		} else {
			targetString += target.charAt(0);
		}
		// check for bla*h illegal
		for (let i = 1; i < target.length - 1; i++) {
			if (target.charAt(i) === "*") {
				console.log("found wildcard in the middle of text. not allowed");
				return null;
			}
			targetString += target.charAt(i);
		}
		// check for blah* or *blah*
		if (target.charAt(target.length - 1) === "*") {
			if (WC === WildcardPosition.front) {
				WC = WildcardPosition.both;
			} else {
				WC = WildcardPosition.end;
			}
		} else {
			targetString += target.charAt(target.length - 1);
		}
		return [WC, targetString];
	}

}


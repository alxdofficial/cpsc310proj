import {
	InsightFilter,
	InsightQuery,
	Logic,
	LogicComparison,
	MComparison,
	MFields,
	Negation,
	SComparison, SFields
} from "./QueryUtil";
import {InsightError} from "./IInsightFacade";
import {kMaxLength} from "buffer";

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
				console.log(key);
				console.log(json);
				return this.logicHelper(key, json);
			case "LT":
			case "GT":
			case "EQ":
				// console.log(key);
				// console.log(json);
				return this.MHelper(key,json);
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
	private MHelper(math: string, json: any): MComparison | null {
		// first check number of keys
		if (Object.keys(json).length > 1) {
			return null;
		}
		this.getIdandField(Object.keys(json)[0]);
		return null;
	}

	// return a SComparison or null if failed to parse
	private SHelper(json: any): SComparison | null {
		return null;
	}

	// return a Negation or null if failed to parse
	private NHelper(json: any): Negation | null {
		return null;
	}

	// helper that takes a string, gets the id portion, and also the field portion. returns null if either is invalid
	private getIdandField(text: string): [string, MFields | SFields] | null {
		let firstUS: number = text.indexOf("_");
		let id = text.substring(0,firstUS);
		let fieldString: string = text.substring(firstUS + 1);
		console.log(id);
		console.log(fieldString);
		return null;
	}

}


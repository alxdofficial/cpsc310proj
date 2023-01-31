import {InsightFilter, InsightQuery, Logic, LogicComparison, MComparison, Negation, SComparison} from "./QueryUtil";
import {InsightError} from "./IInsightFacade";

export class QueryParser {
	private readonly inputJson: any;
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
						// incomplete
					}
				} else {
					reject(new InsightError("input doesnt have key: WHERE"));
				}
				if (this.inputJson["OPTIONS"] !== undefined) {
					console.log("good");
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
				return this.logicHelper(key, json[key]);
			case "LT":
			case "GT":
			case "EQ":
				break;
			case "IS":
				break;
			case "NOT":
				break;
			default:
				// unrecognized key
				return null;
		}
		return null;
	}

	// return a logicComparison or null if failed to parse
	private logicHelper(logic: string, json: []): LogicComparison | null {
		return null;
	}

	// return a MComparison or null if failed to parse
	private MHelper(math: string, json: any): MComparison | null {
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

}


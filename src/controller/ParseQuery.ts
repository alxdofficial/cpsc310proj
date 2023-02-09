import {
	InsightFilter,
	InsightOption,
	InsightQuery,
} from "./InsightQuery";
import {InsightError} from "./IInsightFacade";
import {QueryUtils} from "./QueryUtils";
import {copy} from "fs-extra";

export class QueryParser {
	private readonly inputJson: any;
	private readonly utils: QueryUtils = new QueryUtils();
	constructor(input: any) {
		this.inputJson = input;
	}

	public getQuery(): Promise<InsightQuery> | any { // any is just a stub for now
		return new Promise((resolve,reject) => {
			// first do basic structure check, if good, call helpers.
			if (Object.keys(this.inputJson).length === 2) {

				let filter: InsightFilter | null;
				let option: InsightOption | null;
				// check has WHERE key
				if (this.inputJson["WHERE"] !== undefined) {
					let whereClause = this.inputJson["WHERE"];
					// check no extra or missing keys in WHERE clause
					if (Object.keys(whereClause).length > 1) {
						return reject(new InsightError("wrong number of keys in input->WHERE"));
					} else {
						// after all the switch statements execute, if filter is still null, then we reject promise. if we have filter, use it to create InsiightQuery object
						let key = Object.keys(whereClause)[0];
						filter = this.utils.multiplexInput(key, whereClause[key]);
						if (filter == null) {
							return reject(new InsightError("a valid filter could not be parsed"));
						}
					}
				} else {
					return reject(new InsightError("input doesnt have key: WHERE"));
				}
				// check that options key exists
				if (this.inputJson["OPTIONS"] !== undefined) {
					let optionClause = this.inputJson["OPTIONS"];
					console.log(optionClause);
					option = this.utils.parseOptions(optionClause);
					if (option == null) {
						return reject(new InsightError("options could not be parsed"));
					}
				} else {
					return reject(new InsightError("input doesnt have key: OPTIONS"));
				}
				// everything parsed successfully, so we just create insight query object and return it
				resolve(new InsightQuery(filter,option,this.utils.id));
			} else {
				return reject(new InsightError("wrong number of keys in input"));
			}
		});
	}
}

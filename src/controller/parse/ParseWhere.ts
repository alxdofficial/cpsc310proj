import {InsightError} from "../IInsightFacade";
import {InsightFilter} from "../query/IInsightFilter";
import {ParseMultiplex} from "./ParseMultiplex";
import {QueryParser} from "./QueryParser";

export class ParseWhere {
	public static parseWhere(inputJson: any, parser: QueryParser): Promise<InsightFilter> {
		return new Promise((resolve, reject) => {
			// check has WHERE key
			try {
				if (inputJson["WHERE"] !== undefined) {
					let whereClause = inputJson["WHERE"];
					// check no extra or missing keys in WHERE clause
					if (Object.keys(whereClause).length > 1) {
						return reject(new InsightError("wrong number of keys in input->WHERE"));
					} else if (Object.keys(whereClause).length === 0) {
						return reject(new InsightError("no keys found in input->WHERE"));
					} else {
						// after all the switch statements execute, if filter is still null, then we reject promise. if we have filter, use it to create InsiightQuery object
						let key = Object.keys(whereClause)[0];
						return ParseMultiplex.multiplexInput(key, whereClause[key], parser).then((filter) => {
							return resolve(filter);
						}).catch(function (err) {
							return reject(err);
						});
					}
				} else {
					return reject(new InsightError("input doesnt have key: WHERE"));
				}
			} catch (err) {
				return reject (new InsightError());
			}
		});

	}
}

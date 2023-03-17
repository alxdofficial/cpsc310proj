import Section from "../Section";
import {InsightError, InsightResult} from "../IInsightFacade";
import {QueryUtils} from "../query/QueryUtils";
import {MFields, SFields} from "../query/InsightQuery";

export class QueryOutput {
	public static makeOutput(maps: Array<Map<string, number | string>>): Promise<InsightResult[]> {
		return new Promise((resolve, reject) => {
			// create insight result objects and return
			let output: InsightResult[] = [];
			for (let map of maps) {
				let result: InsightResult;
				for (let [key, value] of Object.entries(map)) {
					if (typeof value !== "number" && typeof value !== "string") {
						return reject(new InsightError("making output failed b" +
							"ecause result map contained non-string and non number value"));
					}
					output.push({key, value});
				}
			}
			return resolve(output);
		});
	}
}

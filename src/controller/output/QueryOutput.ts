import Section from "../Section";
import {InsightError, InsightResult} from "../IInsightFacade";
import {QueryUtils} from "../query/QueryUtils";
import {MFields, SFields} from "../query/InsightQuery";
import e from "express";
import {ResultObj} from "./ResultObj";

export class QueryOutput {
	public static makeOutput(maps: Array<Map<string, number | string>>): Promise<InsightResult[]> {
		return new Promise((resolve, reject) => {
			// create insight result objects and return
			let output: InsightResult[] = [];
			for (let map of maps) {
				let resultObj: ResultObj = {};
				for (let [key, value] of map.entries()) {
					if (typeof value !== "number" && typeof value !== "string") {
						return reject(new InsightError("making output failed b" +
							"ecause result map contained non-string and non number value"));
					}
					resultObj[key] = value;
				}
				output.push(resultObj);
			}
			// console.log(output);
			return resolve(output);
		});
	}
}

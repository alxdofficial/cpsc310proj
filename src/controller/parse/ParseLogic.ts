import {QueryParser} from "./QueryParser";
import {ParseMultiplex} from "./ParseMultiplex";
import {InsightError} from "../IInsightFacade";
import {Logic, LogicComparison} from "../query/LogicComparison";
import {InsightFilter} from "../query/IInsightFilter";

export class ParseLogic {
	public static logicHelper(logic: Logic, filtersJson: any[], parser: QueryParser): Promise<LogicComparison> {
		return new Promise((resolve, reject) => {
			// first check length of input array >= 1
			if (filtersJson.length < 1) {
				return reject(new InsightError("no filter in logic comparison"));
			}
			let filterObjects: InsightFilter[] = [];
			// for each clause in input json, call helper to parse it into InsightFilters, add to array
			for (let filterJson of filtersJson) {
				let jsonKey = Object.keys(filterJson)[0];
				let filterPromise: Promise<InsightFilter> = ParseMultiplex.multiplexInput(jsonKey, filterJson[jsonKey],
					parser);
				filterPromise.then((res: InsightFilter) => {
					filterObjects.push(res);
				}).catch((err) => {
					return reject(err);
				});
			}
			// return Logic comp object
			return resolve(new LogicComparison(logic,filterObjects));
		});
	}
}

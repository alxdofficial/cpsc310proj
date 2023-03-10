import {QueryParser} from "./QueryParser";
import {InsightError} from "../IInsightFacade";
import {ParseMultiplex} from "./ParseMultiplex";
import {Negation} from "../query/Negation";

export class ParseN {

	// return a Negation or null if failed to parse
	public static NHelper(json: any, parser: QueryParser): Promise<Negation> {
		return new Promise((resolve,reject) => {
			if (json.length > 1) {
				return reject(new InsightError("too many filters in negation"));
			}
			let key = Object.keys(json)[0];
			let filter = ParseMultiplex.multiplexInput(key, json[key], parser);
			filter.then((res) => {
				return resolve(new Negation(res));
			}).catch((err) => {
				return reject(err);
			});
		});
	}
}

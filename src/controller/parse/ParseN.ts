import {QueryParser} from "./QueryParser";
import {InsightError} from "../IInsightFacade";
import {ParseMultiplex} from "./ParseMultiplex";
import {Negation} from "../query/Negation";

export class ParseN {

	// return a Negation or null if failed to parse
	public static NHelper(json: any, parser: QueryParser): Promise<Negation> {
		if (json.length > 1) {
			return Promise.reject(new InsightError("too many filters in negation"));
		}
		let key = Object.keys(json)[0];
		return ParseMultiplex.multiplexInput(key, json[key], parser).then((res) => {
			return Promise.resolve(new Negation(res));
		}).catch((err) => {
			return Promise.reject(err);
		});
	}
}

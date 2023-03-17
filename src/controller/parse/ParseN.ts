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
		return ParseMultiplex.multiplexInput(key, json[key], parser).then((res) => { // FIXME resolve or reject here I think, can it return then return? I think it should await for res then return resolve what is in the then
			return Promise.resolve(new Negation(res)); // like const res = await Parse multiplex....
		}).catch((err) => {								// return Promise.resolve ...
			return Promise.reject(err);
		});
	}
}

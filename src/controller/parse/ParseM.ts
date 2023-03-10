import {QueryParser} from "./QueryParser";
import {InsightError} from "../IInsightFacade";
import {IDGetter} from "./IDGetter";
import {FieldGetter} from "./FieldGetter";
import {InsightM, MComparison} from "../query/MComparison";

export class ParseM {
	// return a MComparison or null if failed to parse
	public static MHelper(math: InsightM, json: any, parser: QueryParser): Promise<MComparison> {
		return new Promise((resolve, reject) => {
			// first check number of keys
			if (Object.keys(json).length > 1) {
				return reject(new InsightError("too many keys in M comparison"));
			}
			let key = Object.keys(json)[0];
			// then check if id and field is valid
			// first get ID
			let remainingString = IDGetter.getID(key, parser);
			if (remainingString === null) {
				return reject(new InsightError("id in query is invalid or referenced multiple datasets"));
			}
			// check field
			let field = FieldGetter.MgetField(remainingString);
			if (field === null) {
				return reject(new InsightError("field in query is invalid"));
			}
			// get numeric target value
			let value = json[key];
			if (typeof value !== "number") {
				return reject(new InsightError("number value in M comparison failed to parse"));
			}
			// create MComparison object
			return resolve(new MComparison(math, field, value));
		});
	}
}

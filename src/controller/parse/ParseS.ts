import {QueryParser} from "./QueryParser";
import {InsightError} from "../IInsightFacade";
import {IDGetter} from "./IDGetter";
import {FieldGetter} from "./FieldGetter";
import {StringandWCGetter} from "./StringandWCGetter";
import {SComparison} from "../query/SComparison";

export class ParseS {
	// return a SComparison or null if failed to parse
	public static SHelper(json: any, parser: QueryParser): Promise<SComparison> {
		return new Promise((resolve,reject) => {
			// first check number of keys
			if (Object.keys(json).length > 1) {
				return reject(new InsightError("more than one key in SComparison"));
			}
			let key = Object.keys(json)[0];
			// then check if id and field is valid
			// first get ID
			let remainingString = IDGetter.getID(key, parser);
			if (remainingString === null) {
				return reject(new InsightError("id in query is invalid or referenced multiple datasets"));
			}
			// check field
			let field = FieldGetter.SgetField(remainingString);
			if (field === null) {
				return reject(new InsightError("field in query is invalid"));
			}
			// get string target value and parse wildcard
			let valueAndWC = StringandWCGetter.getSvalueAndWildCard(json[key]);
			if (valueAndWC == null) {
				return reject(new InsightError("string value in SComparison failed to parse"));
			}
			// create MComparison object
			return resolve(new SComparison(field, valueAndWC[0], valueAndWC[1]));
		});
	}
}

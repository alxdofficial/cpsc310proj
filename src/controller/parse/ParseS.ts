import {QueryParser} from "./QueryParser";
import {InsightError} from "../IInsightFacade";
import {IDGetter} from "./IDGetter";
import {FieldGetter} from "./FieldGetter";
import {StringandWCGetter} from "./StringandWCGetter";
import {SComparison} from "../query/SComparison";

export class ParseS {
	// return a SComparison or null if failed to parse
	public static SHelper(json: any, parser: QueryParser): Promise<SComparison> {
		if (Object.keys(json).length > 1) {
			return Promise.reject(new InsightError("more than one key in SComparison"));
		}
		let key = Object.keys(json)[0];
		let remainingString = IDGetter.getID(key, parser);
		if (remainingString === null) {
			throw new InsightError();
			// return Promise.reject(new InsightError("id in query is invalid or referenced multiple datasets"));
		}
		// check field
		let field = FieldGetter.SgetField(remainingString);
		if (field === null) {
			return Promise.reject(new InsightError("field in query is invalid"));
		}
		// get string target value and parse wildcard
		let valueAndWC = StringandWCGetter.getSvalueAndWildCard(json[key]);
		if (valueAndWC == null) {
			return Promise.reject(new InsightError("string value in SComparison failed to parse"));
		}
		// create MComparison object
		return Promise.resolve(new SComparison(field, valueAndWC[0], valueAndWC[1]));
	}
}

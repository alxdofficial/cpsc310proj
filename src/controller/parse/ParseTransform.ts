import {Transformation} from "../output/Transformation";
import {QueryGroup} from "../output/QueryGroup";
import {ParseTransformGroup} from "./ParseTransformGroup";
import {QueryParser} from "./QueryParser";
import {MFields, SFields} from "../query/InsightQuery";
import {ParseTransformApply} from "./ParseTransformApply";


export class ParseTransform {
	public static parseTransform(json: any, parser: QueryParser,
								 fieldsThatExistInOptions: Array<MFields | SFields>): Promise<Transformation | null> {
		// first check if transform is specified
		if (json["TRANSFORMATIONS"] !== undefined) {

			let transformClause = json["TRANSFORMATIONS"];
			let alreadyParsedApplyKeys: string[] = [];
			let group: QueryGroup;
			return ParseTransformGroup.parseTransformGroup(transformClause, parser).then((res) => {
				group = res;
			}).then(() => {
				return ParseTransformApply.parseApply(transformClause, parser, alreadyParsedApplyKeys,
					fieldsThatExistInOptions);
			}).then((res) => {
				return Promise.resolve(new Transformation(group, res));
			}).catch((err) => {
				return Promise.reject(err);
			});
		} else {
			return Promise.resolve(null);
		}
	}
}

import {ApplyRule, Transformation} from "../output/Transformation";
import {QueryGroup} from "../output/QueryGroup";
import {ParseTransformGroup} from "./ParseTransformGroup";
import {QueryParser} from "./QueryParser";
import {MFields, SFields} from "../query/InsightQuery";
import {ParseTransformApply} from "./ParseTransformApply";
import {InsightError} from "../IInsightFacade";

export class ParseTransform {
	public static parseTransform(json: any, parser: QueryParser, optionColumns: string[]):
		Promise<Transformation | null> {
		// first check if transform is specified
		if (json["TRANSFORMATIONS"] !== undefined) {

			let transformClause = json["TRANSFORMATIONS"];
			let alreadyParsedApplyKeys: string[] = [];
			let group: QueryGroup;
			return ParseTransformGroup.parseTransformGroup(transformClause, parser).then((res) => {
				group = res;
			}).then(() => {
				return ParseTransformApply.parseApply(transformClause,parser, alreadyParsedApplyKeys);
			}).then((rules) => {
				if (this.checkGroupAndApplyColumns(group,rules,optionColumns.slice(), parser)) {
					return Promise.resolve(new Transformation(group,rules));
				}
				return Promise.reject(new InsightError("some columns in group or some apply keys dont correspond " +
					"to column in options"));
			}).catch((err) => {
				return Promise.reject(err);
			});
		} else {
			return Promise.resolve(null);
		}
	}

	private static checkGroupAndApplyColumns(group: QueryGroup, applyRules: ApplyRule[], optionColumns: string[],
											 parser: QueryParser): boolean {
		// first check all group keys are included in option columns
		for (let field of group.groupKeys) {
			let fieldStr: string = parser.dataset_id + "_" + String(field);
			if (optionColumns.includes(fieldStr)) {
				// check off the corresponding column
				optionColumns.splice(optionColumns.indexOf(fieldStr), 1);
			} else {
				return false;
			}
 		}
		// check all applykeys in APPLY
		for (let applyRule of applyRules) {
			let applyKey: string = applyRule.applyKey;
			if (optionColumns.includes(applyKey)) {
				// check off the corresponding column
				optionColumns.splice(optionColumns.indexOf(applyKey), 1);
			} else {
				return false;
			}
		}
		// check if there are left over columns that dont correspond to either a group or apply
		return optionColumns.length === 0;
	}
}

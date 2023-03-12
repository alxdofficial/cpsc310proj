import {QueryGroup} from "../output/QueryGroup";
import {InsightError} from "../IInsightFacade";
import {QueryParser} from "./QueryParser";
import {IDGetter} from "./IDGetter";
import {MFields, SFields} from "../query/InsightQuery";
import {FieldGetter} from "./FieldGetter";
import {ApplyRule} from "../output/Transformation";

export class ParseTransformGroup {
	public static parseTransformGroup(json: any, parser: QueryParser): Promise<QueryGroup> {
		return new Promise((resolve, reject) => {
			if (json["GROUP"] === undefined) {
				return reject(new InsightError("group key not found in transformation"));
			} else {
				let groupClause = json["GROUP"];
				if (groupClause.length < 1) {
					return resolve(new QueryGroup([]));
				} else {
					let fields: Array<MFields | SFields> = [];
					for (let key of groupClause) {
						let remainingStr = IDGetter.getID(key, parser);
						if (remainingStr == null) {
							return reject(new InsightError("getting id in query->transform->group failed deu to" +
								" query referencing multiple datasets"));
						} else {
							let field: MFields | SFields | null = FieldGetter.getField(remainingStr);
							if (field == null) {
								return reject(new InsightError("getting field in query->transform->group failed"));
							} else {
								fields.push(field);
							}
						}
					}
					if (fields.length < 1) {
						return reject(new InsightError("no valid fields in query->transform->group "));
					}
					let group = new QueryGroup(fields);
					return resolve(group);
				}
			}
		});
	}
}

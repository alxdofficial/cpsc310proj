import {MFields, SFields} from "../query/InsightQuery";
import {QueryParser} from "./QueryParser";
import {IDGetter} from "./IDGetter";
import {FieldGetter} from "./FieldGetter";
import {InsightError} from "../IInsightFacade";

export class ParseOptionSort {
	public static parseOptionOrder(json: any, optionColumns: Array<MFields | SFields>,
								   parser: QueryParser): Promise<MFields | SFields | null> {
		return new Promise((resolve, reject) => {
			// check an ORDER is specified
			let order: MFields | SFields | null = null;
			if (json["ORDER"] !== undefined) {
				// take out id portion of input
				let remainingString = IDGetter.getID(json["ORDER"], parser);
				let column: MFields | SFields | null = FieldGetter.getField(remainingString);
				if (column == null) {
					return reject(new InsightError("column in query->option->order failed to pares"));
				}
				if (optionColumns.includes(column)) {
					order = column;
				} else {
					return reject(new InsightError("order column is not included in output column"));
				}
			}
			return resolve(order);
		});
	}
}

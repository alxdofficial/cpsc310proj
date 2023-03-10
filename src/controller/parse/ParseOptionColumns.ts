import {MFields, SFields} from "../query/InsightQuery";
import {QueryParser} from "./QueryParser";
import {InsightError} from "../IInsightFacade";
import {IDGetter} from "./IDGetter";
import {FieldGetter} from "./FieldGetter";

export class ParseOptionColumns {
	public static parseOptionColumns(json: any, parser: QueryParser): Promise<Array<MFields | SFields>> {
		return new Promise((resolve, reject) => {
			// check that COLUMNS exist
			if (json["COLUMNS"] === undefined) {
				// console.log("COLUMNS key dont exist");
				return reject(new InsightError("COLUMNS key dont exist"));
			}
			let jsonColumns = json["COLUMNS"];
			if (jsonColumns.length < 1) {
				// console.log("no colmns in column key");
				return reject(new InsightError("no columns in query->option->columns"));
			}
			// get each column
			let optionColumns: Array<MFields | SFields> = [];
			for (let jsonColumn of jsonColumns) {
				// first take out the id portion
				let remainingStr = IDGetter.getID(jsonColumn,parser);
				if (remainingStr === null) {
					return reject(new InsightError("parsing id in 'id_field' for query->options->columns failed"));
				}
				// get the field
				let column: MFields | SFields | null = FieldGetter.getField(remainingStr);
				// if column is null we have error
				if (column == null) {
					return reject(new InsightError("one of the columns could not be parsed"));
				}
				optionColumns.push(column);
			}
			// check we have at least 1 validated column
			if (optionColumns.length < 1) {
				return reject(new InsightError("no valid columns in options->columns"));
			}
			return resolve(optionColumns);
		});
	}
}

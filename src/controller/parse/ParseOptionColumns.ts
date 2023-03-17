import {MFields, SFields} from "../query/InsightQuery";
import {QueryParser} from "./QueryParser";
import {InsightError} from "../IInsightFacade";
import {IDGetter} from "./IDGetter";
import {FieldGetter} from "./FieldGetter";
import e from "express";

export class ParseOptionColumns {
	public static parseOptionColumns(json: any, parser: QueryParser): Promise<Array<MFields | SFields | string>> {
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
			let optionColumns: string[] = [];
			for (let jsonColumn of jsonColumns) {
				// first check if we have input like 'id_field'
				if (jsonColumn.includes("_")) {
					let proposedField = FieldGetter.getOnlyField(jsonColumn, parser);
					if (proposedField === null) {
						return reject(new InsightError("field invalid in suspected 'id_field in " +
							"query->options->colummns'"));
					}
					optionColumns.push(jsonColumn);
				} else {
					// we likely have apply key
					optionColumns.push(jsonColumn);
				}
			}
			// check we have at least 1 validated column
			if (optionColumns.length < 1) {
				return reject(new InsightError("no valid columns in options->columns"));
			}
			return resolve(optionColumns);
		});
	}
}

import {MFields, SFields} from "../query/InsightQuery";
import {QueryParser} from "./QueryParser";
import {InsightError} from "../IInsightFacade";
import {ParseOptionColumns} from "./ParseOptionColumns";
import {ParseOptionSort} from "./ParseOptionSort";
import {InsightOption} from "../output/InsightOption";

export class ParseOption {
	// given json, returns insight option object, and null if parsing error.
	public static parseOptions(json: any, parser: QueryParser): Promise<InsightOption> {
		return new Promise((resolve, reject) => {
			// check that options key exists
			if (json["OPTIONS"] !== undefined) {
				let optionClause = json["OPTIONS"];
				// call helpers
				let columns: string[];
				return ParseOptionColumns.parseOptionColumns(optionClause, parser).then((cols) => { // FIXME resolve or reject here I think, can it return then return? I think it should await for cols then return resolve what is in the then
					columns = cols;
					return ParseOptionSort.parseOptionOrder(optionClause, cols, parser);
				}).then((order) => {
					// create the option object and return it
					return resolve(new InsightOption(columns, order));
				}).catch((err) => {
					return reject(err);
				});
			} else {
				return reject(new InsightError("input doesnt have key: OPTIONS"));
			}
		});
	}
}

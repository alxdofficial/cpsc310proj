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
				return ParseOptionColumns.parseOptionColumns(optionClause, parser).then((cols) => {
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

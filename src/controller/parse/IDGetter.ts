import {MFields, SFields} from "../query/InsightQuery";
import {QueryParser} from "./QueryParser";

export class IDGetter {
	// sets the dataset id in query parser object for later use, returns input string without "id_", or null if error
	public static getID(text: string, parser: QueryParser): string | null {
		let firstUSIndex: number = text.indexOf("_");
		let id = text.substring(0,firstUSIndex);
		if (parser.dataset_id === "" || parser.dataset_id === id) {
			parser.dataset_id = id;
			return text.substring(firstUSIndex + 1);
		} else {
			// console.log("this query refers to multiple datasets");
			return null;
		}
	}
}

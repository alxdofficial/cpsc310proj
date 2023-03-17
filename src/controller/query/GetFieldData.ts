import Section from "../Section";
import {MFields, SFields} from "./InsightQuery";
import Room from "../Room";
import {InsightError} from "../IInsightFacade";

export class GetFieldData {
	// eslint-disable-next-line max-lines-per-function
	public static getFieldData(entry: Section | Room, field: MFields | SFields): number | string | null {
		for (let [key, value] of Object.entries(entry)) {
			if (String(key) === String(field)) {
				return value;
			}
		}
		return null;
	}
}

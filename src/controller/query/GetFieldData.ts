import Section from "../Section";
import {MFields, SFields} from "./InsightQuery";
import Room from "../Room";

export class GetFieldData {
	public static getFieldData(entry: Section | Room, field: MFields | SFields): number | string | null {
		for (let [key, value] of Object.entries(entry)) {
			if (String(key) === String(field)) {
				return value;
			}
		}
		return null;
	}
}

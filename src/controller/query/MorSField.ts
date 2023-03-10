import {MFields, SFields} from "./InsightQuery";

export class MorSField {
	public static MorSField(field: MFields | SFields): string {
		switch (field) {
			case MFields.avg:
			case MFields.pass:
			case MFields.fail:
			case MFields.audit:
			case MFields.year:
				return "m";
			case SFields.dept:
			case SFields.id:
			case SFields.instructor:
			case SFields.title:
			case SFields.uuid:
				return "s";
		}
		return "false";
	}
}

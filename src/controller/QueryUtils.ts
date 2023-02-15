import Section from "./Section";
import {MFields, SFields} from "./InsightQuery";
import {InsightError} from "./IInsightFacade";

export class QueryUtils {
	public static getSectionData(section: Section, field: MFields | SFields): number | string {
		switch (field) {
			case MFields.avg:
				return section.avg;
			case MFields.pass:
				return section.pass;
			case MFields.fail:
				return section.fail;
			case MFields.audit:
				return section.audit;
			case MFields.year:
				return section.year;
			case SFields.dept:
				return section.dept;
			case SFields.id:
				return section.id;
			case SFields.instructor:
				return section.instructor;
			case SFields.title:
				return section.title;
			case SFields.uuid:
				return section.getID();
		}
	}
	public static MorSField(field: MFields | SFields): string {
		switch (field) {
			case MFields.avg:
				return "m";
			case MFields.pass:
				return "m";
			case MFields.fail:
				return "m";
			case MFields.audit:
				return "m";
			case MFields.year:
				return "m";
			case SFields.dept:
				return "s";
			case SFields.id:
				return "s";
			case SFields.instructor:
				return "s";
			case SFields.title:
				return "s";
			case SFields.uuid:
				return "s";
		}
	}
	// public static checkQueryReturnType(result: any): string {
	// 	if (result instanceof InsightError) {
	// 		return "InsightError";
	// 	} else if (Array.isArray(result)) {
	// 		if (result.length > 0) {
	// 			return  "InsightResult[]";
	// 		} else {
	// 			return "[]";
	// 		}
	// 	}
	// 	return "undefined";
	// }

}


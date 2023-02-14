import Section from "./Section";
import {MFields, SFields} from "./InsightQuery";

export class QueryUtils {
	public static getSectionData(section: Section, field: MFields | SFields): number | string{
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
}


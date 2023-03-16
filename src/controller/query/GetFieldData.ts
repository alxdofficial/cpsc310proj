import Section from "../Section";
import {MFields, SFields} from "./InsightQuery";
import Room from "../Room";
import {InsightError} from "../IInsightFacade";

export class GetFieldData {
	// eslint-disable-next-line max-lines-per-function
	public static getFieldData(entry: Section | Room, field: MFields | SFields): Promise<number | string> {
		// eslint-disable-next-line max-lines-per-function!!!
		if (entry instanceof Section) {
			switch (field) {
				case MFields.avg:
					return Promise.resolve(entry.avg);
				case MFields.pass:
					return Promise.resolve(entry.pass);
				case MFields.fail:
					return Promise.resolve(entry.fail);
				case MFields.audit:
					return Promise.resolve(entry.audit);
				case MFields.year:
					return Promise.resolve(entry.year);
				case SFields.dept:
					return Promise.resolve(entry.dept);
				case SFields.id:
					return Promise.resolve(entry.id);
				case SFields.instructor:
					return Promise.resolve(entry.instructor);
				case SFields.title:
					return Promise.resolve(entry.title);
				case SFields.uuid:
					return Promise.resolve(entry.getID());
				default:
					return Promise.reject(new InsightError("field" + field + " not found for entry of type 'Section'"));
			}
		} else {
			switch (field) {
				case MFields.lon:
					return Promise.resolve(entry.lon);
				case MFields.lat:
					return Promise.resolve(entry.lat);
				case MFields.seats:
					return Promise.resolve(entry.seats);
				case SFields.address:
					return Promise.resolve(entry.address);
				case SFields.fullname:
					return Promise.resolve(entry.fullname);
				case SFields.furniture:
					return Promise.resolve(entry.furniture);
				case SFields.href:
					return Promise.resolve(entry.href);
				case SFields.number:
					return Promise.resolve(entry.number);
				case SFields.name:
					return Promise.resolve(entry.name);
				case SFields.shortname:
					return Promise.resolve(entry.shortname);
				case SFields.type:
					return Promise.resolve(entry.type);
				default:
					return Promise.reject(new InsightError("field" + field + " not found for entry of type 'Room'"));
			}
		}
	}
}

import Section from "../datasetProcessor/Section";
import {MFields, SFields} from "./InsightQuery";
import Room from "../datasetProcessor/Room";
import {InsightError} from "../IInsightFacade";

export class GetFieldData {
	// eslint-disable-next-line max-lines-per-function
	public static getFieldData(entry: Section | Room, field: MFields | SFields): Promise<number | string> {
		// eslint-disable-next-line max-lines-per-function
		return new Promise((resolve, reject) => {
			if (entry instanceof Section) {
				switch (field) {
					case MFields.avg:
						return resolve(entry.avg);
					case MFields.pass:
						return resolve(entry.pass);
					case MFields.fail:
						return resolve(entry.fail);
					case MFields.audit:
						return resolve(entry.audit);
					case MFields.year:
						return resolve(entry.year);
					case SFields.dept:
						return resolve(entry.dept);
					case SFields.id:
						return resolve(entry.id);
					case SFields.instructor:
						return resolve(entry.instructor);
					case SFields.title:
						return resolve(entry.title);
					case SFields.uuid:
						return resolve(entry.getID());
					default:
						return reject(new InsightError("field" + field + " not found for entry of type 'Section'"));
				}
			} else if (entry instanceof Room) {
				switch (field) {
					case MFields.lon:
						return resolve(entry.lon);
					case MFields.lat:
						return resolve(entry.lat);
					case MFields.seats:
						return resolve(entry.seats);
					case SFields.address:
						return resolve(entry.address);
					case SFields.fullname:
						return resolve(entry.fullname);
					case SFields.furniture:
						return resolve(entry.furniture);
					case SFields.href:
						return resolve(entry.href);
					case SFields.number:
						return resolve(entry.number);
					case SFields.name:
						return resolve(entry.name);
					case SFields.shortname:
						return resolve(entry.shortname);
					case SFields.type:
						return resolve(entry.type);
					default:
						return reject(new InsightError("field" + field + " not found for entry of type 'Room'"));
				}
			}
		});
	}
}

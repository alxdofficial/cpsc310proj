import {MFields, SFields} from "../query/InsightQuery";
import {QueryParser} from "./QueryParser";
import {IDGetter} from "./IDGetter";

export class FieldGetter {
	// helper that takes a string, gets the id portion, sets the id field of this object if it hasnt been set yet or the gotten id is equal to the current id, and also the field portion. returns null if either is invalid
	public static MgetField(fieldString: string): MFields | null {
		switch (fieldString) {
			case "avg":
				return MFields.avg;
			case "pass":
				return MFields.pass;
			case "fail":
				return MFields.fail;
			case "audit":
				return MFields.audit;
			case "year":
				return MFields.year;
			case "lat":
				return MFields.lat;
			case "lon":
				return MFields.lon;
			case "seats":
				return MFields.seats;
			default:
				// console.log("M either id or field couldnt be parsed or is incorrect type");
				return null;
		}
	}

	public static SgetField(fieldString: string): SFields | null {
		switch (fieldString) {
			case "dept":
				return SFields.dept;
			case "id":
				return SFields.id;
			case "instructor":
				return SFields.instructor;
			case "title":
				return SFields.title;
			case "uuid":
				return SFields.uuid;
			case "fullname" :
				return SFields.fullname;
			case"shortname" :
				return SFields.shortname;
			case"number" :
				return SFields.number;
			case"name" :
				return SFields.name;
			case"address" :
				return SFields.address;
			case"type" :
				return SFields.type;
			case"furniture" :
				return SFields.furniture;
			case"href":
				return SFields.href;
			default:
				// console.log("S either id or field couldnt be parsed or is incorrect type");
				return null;
		}
	}

	public static getField(inputJson: any): MFields  | SFields | null {
		// try to see if input references S field
		let column: MFields | SFields | null = FieldGetter.SgetField(inputJson);
		// if it comes back null, try M field
		if (column == null) {
			column = FieldGetter.MgetField(inputJson);
		}
		return column;
	}

	public static getOnlyField(str: string, parser: QueryParser): MFields | SFields | null {
		let remainingStr = IDGetter.getID(str, parser);
		if (remainingStr == null) {
			return null;
		}
		return this.getField(remainingStr);
	}
}

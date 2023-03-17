import Room from "../Room";
import Section from "../Section";
import {MFields, SFields} from "../query/InsightQuery";
import {GetFieldData} from "../query/GetFieldData";
import {MorSField} from "../query/MorSField";
import {InsightError} from "../IInsightFacade";

export class InsightSort {
	public direction: Dir;
	public fields: string[];
	constructor(dir: Dir, fields: string[]) {
		this.direction = dir;
		this.fields = fields;
	}

}


export enum Dir {
	"up"= 1, "down"= -1
}


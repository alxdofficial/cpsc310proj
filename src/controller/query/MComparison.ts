import Section from "../Section";
import {QueryUtils} from "./QueryUtils";
import {InsightFilter} from "./IInsightFilter";
import {MFields} from "./InsightQuery";
import {GetFieldData} from "./GetFieldData";
import Room from "../Room";
import {InsightError} from "../IInsightFacade";
export enum InsightM {lt, gt, eq}
export class MComparison implements InsightFilter {
	public math: InsightM;
	public mfield: MFields;
	public value: number;
	constructor(math: InsightM,mfield: MFields, value: number) {
		this.math = math;
		this.mfield = mfield;
		this.value = value;
	}

	public doFilter(entry: Section | Room): Promise<boolean> {
		return new Promise((resolve, reject) => {
			let val: number | string | null = GetFieldData.getFieldData(entry, this.mfield);
			if (val == null || typeof val !== "number") {
				return reject(new InsightError("retrieve data from entry failed in Mcomp"));
			}
			if (this.math === InsightM.lt) {
				return resolve(val < this.value);
			} else if (this.math === InsightM.gt) {
				return resolve(val > this.value);
			} else if (this.math === InsightM.eq) {
				return resolve(val === this.value);
			}
		});
	}
}

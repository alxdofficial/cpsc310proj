import Section from "../datasetProcessor/Section";
import {QueryUtils} from "./QueryUtils";
import {InsightFilter} from "./IInsightFilter";
import {MFields} from "./InsightQuery";
import {GetFieldData} from "./GetFieldData";
import Room from "../datasetProcessor/Room";
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
			let val: number;
			GetFieldData.getFieldData(entry, this.mfield).then((res) => {
				val = res as number;
			}).then(() => {
				if (this.math === InsightM.lt) {
					return resolve(val < this.value);
				} else if (this.math === InsightM.gt) {
					return resolve(val > this.value);
				} else if (this.math === InsightM.eq) {
					return resolve(val === this.value);
				}
			}).catch((err) => {
				return reject(err);
			});
		});
	}
}

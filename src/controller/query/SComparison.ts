import Section from "../datasetProcessor/Section";
import {QueryUtils} from "./QueryUtils";
import {SFields} from "./InsightQuery";
import Room from "../datasetProcessor/Room";
import {GetFieldData} from "./GetFieldData";
import {InsightFilter} from "./IInsightFilter";

export enum WildcardPosition {none,front,end,both}
export class SComparison implements InsightFilter{
	public sfield: SFields;
	public wildcardPosition: WildcardPosition;
	public value: string;
	constructor(sfield: SFields, wildcardPosition: WildcardPosition, value: string) {
		this.sfield = sfield;
		this.wildcardPosition = wildcardPosition;
		this.value = value;
	}

	public doFilter(entry: Section | Room): Promise<boolean> {
		return new Promise((resolve, reject) => {
			let val: string;
			GetFieldData.getFieldData(entry, this.sfield).then((res) => {
				val = String(res);
			}).then(() => {
				switch (this.wildcardPosition) {
					case WildcardPosition.none:
						return resolve(val === this.value);
					case WildcardPosition.front:
						return resolve(val.endsWith(this.value));
					case WildcardPosition.end:
						return resolve(val.startsWith(this.value));
					case WildcardPosition.both:
						return resolve(val.includes(this.value));
				}
			}).catch((err) => {
				return reject(err);
			});
		});
	}
}

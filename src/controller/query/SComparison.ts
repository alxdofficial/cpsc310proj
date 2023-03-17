import Section from "../Section";
import {QueryUtils} from "./QueryUtils";
import {SFields} from "./InsightQuery";
import Room from "../Room";
import {GetFieldData} from "./GetFieldData";
import {InsightFilter} from "./IInsightFilter";
import {InsightError} from "../IInsightFacade";

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
			let val = GetFieldData.getFieldData(entry, this.sfield);
			if (val == null || typeof val !== "string") {
				return reject(new InsightError("retrieve data from entry failed in Scomp"));
			}
			switch (this.wildcardPosition) {
				case WildcardPosition.none:
					return resolve(val === this.value);
				case WildcardPosition.front:
					return resolve(val.endsWith(this.value));
				case WildcardPosition.end:
					return resolve(val.startsWith(this.value));
				case WildcardPosition.both:
					return resolve(val.includes(this.value));
			} // FIXME does it need a default case? like reject(....)
		});
	}
}

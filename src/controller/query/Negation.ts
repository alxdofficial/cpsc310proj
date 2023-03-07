import Section from "../Section";
import {InsightFilter} from "./IInsightFilter";
import Room from "../Room";

export class Negation implements InsightFilter {
	public filter: InsightFilter;
	public doFilter(entry: Section | Room): Promise<boolean> {
		return this.filter.doFilter(entry).then((res) => {
			return Promise.resolve(!res);
		}).catch((err) => {
			return Promise.reject(err);
		});
	}

	constructor(filter: InsightFilter) {
		this.filter = filter;
	}
}

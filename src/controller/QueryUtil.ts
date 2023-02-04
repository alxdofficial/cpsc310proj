import Section from "./Section";


export class InsightQuery {
	private id: string;
	private body: InsightFilter;
	private options: InsightOption;
	constructor(inputBody: InsightFilter, inputOptions: InsightOption, id: string) {
		console.log("new instance of insight query");
		this.body = inputBody;
		this.options = inputOptions;
		this.id = id;
	}
}

export enum MFields { avg,pass,fail,audit,year }
export enum SFields { dept,id,instructor,title,uuid}

export interface InsightFilter {
	doFilter(section: Section): boolean
	// this method takes 1 section as input, labels that section true/false for whether to include it in query.
}

export enum Logic {And, Or}
export class LogicComparison implements InsightFilter {
	public logic: Logic;
	public filterList: InsightFilter[];
	constructor(logic: Logic, filterList: InsightFilter[]) {
		this.logic = logic;
		this.filterList = filterList;
	}
	 public doFilter(data: Section): boolean {
		if (this.logic === Logic.And) {
			return false;
		} else if (this.logic === Logic.Or) {
			return false;
		}
		return false;
	}
}

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

	public doFilter(data: Section): boolean {
		if (this.math === InsightM.lt) {
			return false;
		} else if (this.math === InsightM.gt) {
			return false;
		} else if (this.math === InsightM.eq) {
			return false;
		}
		return false;
	}
}

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

	public doFilter(data: Section): boolean {
		switch (this.wildcardPosition) {
			case WildcardPosition.none:
				break;
			case WildcardPosition.front:
				break;
			case WildcardPosition.end:
				break;
			case WildcardPosition.both:
				break;
		}
		return false;
	}
}

export class Negation implements InsightFilter {
	public filter: InsightFilter;
	public doFilter(data: Section): boolean {
		return false;
	}
	constructor(filter: InsightFilter) {
		this.filter = filter;
	}
}

export class InsightOption {
}

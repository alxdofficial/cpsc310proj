import Section from "./Section";
import {QueryUtils} from "./QueryUtils";


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
	// public doQuery(): Section[] {
	// 	// sectionsInDataset: Section[] = []
	// }
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
	 public doFilter(section: Section): boolean {
		if (this.logic === Logic.And) {
			let pred: boolean = true;
			// eslint-disable-next-line @typescript-eslint/prefer-for-of
			for (let i = 0;i < this.filterList.length;i++) {
				pred = pred && this.filterList[i].doFilter(section);
			}
			return pred;
		} else if (this.logic === Logic.Or) {
			let pred: boolean = true;
			// eslint-disable-next-line @typescript-eslint/prefer-for-of
			for (let i = 0;i < this.filterList.length;i++) {
				pred = pred || this.filterList[i].doFilter(section);
			}
			return pred;
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
	public doFilter(section: Section): boolean {
		if (this.math === InsightM.lt) {
			return this.getSectionMData(section, this.mfield) < this.value;
		} else if (this.math === InsightM.gt) {
			return this.getSectionMData(section, this.mfield) > this.value;;
		} else if (this.math === InsightM.eq) {
			return this.getSectionMData(section, this.mfield) === this.value;
		}
		return false;
	}
	public getSectionMData(section: Section, field: MFields): number {
		switch (field) {
			case MFields.avg:
				return section.avg;
			case MFields.pass:
				return section.pass;
			case MFields.fail:
				return section.fail;
			case MFields.audit:
				return section.audit;
			case MFields.year:
				return section.year;
		}
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
	public doFilter(section: Section): boolean {
		let fieldStr: string = this.getSectionSData(section,this.sfield);
		switch (this.wildcardPosition) {
			case WildcardPosition.none:
				return fieldStr === this.value;
			case WildcardPosition.front:
				return fieldStr.endsWith(this.value);
			case WildcardPosition.end:
				return fieldStr.startsWith(this.value);
			case WildcardPosition.both:
				return fieldStr.includes(this.value);
		}
		return false;
	}
	public getSectionSData(section: Section, field: SFields): string {
		switch (field) {
			case SFields.dept:
				return section.dept;
			case SFields.id:
				return section.id;
			case SFields.instructor:
				return section.instructor;
			case SFields.title:
				return section.title;
			case SFields.uuid:
				return section.getID();
		}
	}
}

export class Negation implements InsightFilter {
	public filter: InsightFilter;
	public doFilter(section: Section): boolean {
		return !this.filter.doFilter(section);
	}
	constructor(filter: InsightFilter) {
		this.filter = filter;
	}
}

export class InsightOption {
	public columns: Array<MFields | SFields>;
	public order: MFields | SFields | null = null;
	constructor(columns: Array<MFields | SFields>, order: MFields | SFields | null) {
		this.columns = columns;
		this.order = order;
	}
}

import Section from "./Section";
import InsightFacade from "./InsightFacade";
import {InsightDataset, InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {QueryUtils} from "./QueryUtils";


export class InsightQuery {
	private id: string;
	public body: InsightFilter;
	public options: InsightOption;
	private facade: InsightFacade;
	constructor(inputBody: InsightFilter, inputOptions: InsightOption, id: string, facade: InsightFacade) {
		console.log("new instance of insight query");
		this.body = inputBody;
		this.options = inputOptions;
		this.id = id;
		this.facade = facade;
	}
	public async doQuery(): Promise<InsightResult[]> {
		// the query promise
		return new Promise((resolve, reject) => {
			// first check our dataset exists, and throw error if not
			let allSections: Map<InsightDataset, Section[]> = this.facade.getAllDatasets();
			let sections: Section[] | undefined;
			for (let key of allSections.keys()) {
				if (key.id === this.id) {
					sections = allSections.get(key);
					break;
				}
			}
			if (sections === undefined) {
				return reject(new InsightError("dataset of this query's referenced id is not found"));
			}
			// do query found dataset
			let outputSections: Section[] = [];
			for (let section of sections) {
				let addpred: boolean = this.body.doFilter(section);
				if (addpred) {
					outputSections.push(section);
				}
			}
			// check if too many results
			if (outputSections.length > 5000) {
				return reject(new ResultTooLargeError());
			}
			return resolve(this.makeOutput(outputSections));
		});
	}
	public makeOutput(sections: Section[]): InsightResult[] {
		// sort the sections if neccasary
		let orderedSections = sections;
		if (this.options.order != null) {
			let orderCol: MFields | SFields = this.options.order;
			sections.sort( (a,b) => {
				return QueryUtils.getSectionData(a, orderCol) < QueryUtils.getSectionData(b,orderCol) ? -1 : 1;
			});
		}
		// create insight result objects and return
		let output: InsightResult[] = [];
		for (let section of orderedSections) {
			let result: InsightResult = {};
			for (let columnn of this.options.columns) {
				if (QueryUtils.MorSField(columnn) === "m") {
					result[this.id + "_" + columnn] = Number(QueryUtils.getSectionData(section,columnn));
				} else if (QueryUtils.MorSField(columnn) === "s") {
					result[this.id + "_" + columnn] = String(QueryUtils.getSectionData(section,columnn));
				}
			}
			output.push(result);
		}
		return output;
	}
}

export enum MFields { avg="avg",pass="pass",fail="fail",audit="audit",year="year" }
export enum SFields { dept="dept",id="id",instructor="instructor",title="title",uuid="uuid"}

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
			for (let filter of this.filterList) {
				pred = pred && filter.doFilter(section);
			}
			return pred;
		} else if (this.logic === Logic.Or) {
			for (let filter of this.filterList) {
				if(filter.doFilter(section)) {
					return true;
				}
			}
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
	public doFilter(section: Section): boolean {
		let sectionVal: number = Number(QueryUtils.getSectionData(section,this.mfield));
		if (this.math === InsightM.lt) {
			return sectionVal < this.value;
		} else if (this.math === InsightM.gt) {
			return sectionVal > this.value;
		} else if (this.math === InsightM.eq) {
			return sectionVal === this.value;
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
	public doFilter(section: Section): boolean {
		let fieldStr = String(QueryUtils.getSectionData(section,this.sfield));
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

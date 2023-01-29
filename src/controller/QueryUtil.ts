

class InsightQuery {
	private body: InsightFilter;
	private options: InsightOption;
	constructor(inputBody: InsightFilter, inputOptions: InsightOption) {
		console.log("new instance of insight query");
		this.body = inputBody;
		this.options = inputOptions;
	}
}

class Section {
// 	dummy class, will be replaced by partners actual code
}
enum MFields { avg="avg",pass="pass",fail="fail",audit="audit",year="year" }
enum SFields { dept="dept",id="id",instructor="instructor",title="title",uuid="uuid"}

interface InsightFilter {
	doFilter(data: Section[]): Section[]
}

enum Logic {And, Or}
class LogicComparison implements InsightFilter {
	public logic: Logic;
	public filterList: InsightFilter[];
	constructor(logic: Logic, filterList: InsightFilter[]) {
		this.logic = logic;
		this.filterList = filterList;
	}
	 public doFilter(data: Section[]): Section[] {
		if (this.logic === Logic.And) {
			return [];
		} else if (this.logic === Logic.Or) {
			return [];
		}
		return [];
	}
}

enum InsightM {lt, gt, eq}
class MComparison implements InsightFilter {
	public math: InsightM;
	public mfield: MFields;
	public value: number;

	constructor(math: InsightM,mfield: MFields, value: number) {
		this.math = math;
		this.mfield = mfield;
		this.value = value;
	}

	public doFilter(data: Section[]): Section[] {
		if (this.math === InsightM.lt) {
			return [];
		} else if (this.math === InsightM.gt) {
			return [];
		} else if (this.math === InsightM.eq) {
			return [];
		}
		return [];
	}
}

enum WildcardPosition {none,front,end,both}
class SComparison implements InsightFilter{
	public sfield: SFields;
	public wildcardPosition: WildcardPosition;
	public value: string;
	constructor(sfield: SFields, wildcardPosition: WildcardPosition, value: string) {
		this.sfield = sfield;
		this.wildcardPosition = wildcardPosition;
		this.value = value;
	}

	public doFilter(data: Section[]): Section[] {
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
		return [];
	}
}

class Negation implements InsightFilter {
	public filter: InsightFilter;
	public doFilter(data: Section[]): Section[] {
		return [];
	}
	constructor(filter: InsightFilter) {
		this.filter = filter;
	}
}

class InsightOption {
}

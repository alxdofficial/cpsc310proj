import Section from "../Section";
import {InsightResult} from "../IInsightFacade";
import {QueryUtils} from "../query/QueryUtils";
import {MFields, SFields} from "../query/InsightQuery";

export class QueryOutput {
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

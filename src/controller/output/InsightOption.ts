import {MFields, SFields} from "../query/InsightQuery";
import {InsightSort} from "./InsightSort";

export class InsightOption {
	public columns: string[];
	public sort: InsightSort | null = null;
	constructor(columns: string[], sort: InsightSort | null) {
		this.columns = columns;
		this.sort = sort;
	}
}

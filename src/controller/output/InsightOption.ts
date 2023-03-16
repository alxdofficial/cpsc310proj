import {MFields, SFields} from "../query/InsightQuery";

export class InsightOption {
	public columns: Array<MFields | SFields>;
	public sort: MFields | SFields | null = null;
	constructor(columns: Array<MFields | SFields>, sort: MFields | SFields | null) {
		this.columns = columns;
		this.sort = sort;
	}
}

import {MFields, SFields} from "../query/InsightQuery";

export class QueryGroup {
	private groupKeys: Array<MFields | SFields>;
	constructor(keys: Array<MFields | SFields>) {
		this.groupKeys = keys;
	}
}

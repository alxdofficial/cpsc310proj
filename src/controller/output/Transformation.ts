import {MFields, SFields} from "../query/InsightQuery";
import {QueryGroup} from "./QueryGroup";

export class Transformation {
	private groups: QueryGroup;
	private applyRuleList: ApplyRule[] = [];
	constructor(groupKeys: QueryGroup, applylist: ApplyRule[]) {
		this.groups = groupKeys;
		this.applyRuleList = applylist;
	}


}

export class ApplyRule {
	private token: ApplyTokens;
	private key: MFields | SFields;
	constructor(token: ApplyTokens, key: MFields | SFields) {
		this.token = token;
		this.key = key;
	}
}

export enum ApplyTokens {
	"MAX" , "MIN" , "AVG", "COUNT" , "SUM"
}



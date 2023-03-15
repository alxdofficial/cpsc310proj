import {MFields, SFields} from "../query/InsightQuery";
import {QueryGroup} from "./QueryGroup";

export class Transformation {
	public groups: QueryGroup;
	public applyRuleList: ApplyRule[] = [];
	constructor(groupKeys: QueryGroup, applylist: ApplyRule[]) {
		this.groups = groupKeys;
		this.applyRuleList = applylist;
	}


}

export class ApplyRule {
	public token: ApplyTokens;
	public key: MFields | SFields;
	constructor(token: ApplyTokens, key: MFields | SFields) {
		this.token = token;
		this.key = key;
	}
}

export enum ApplyTokens {
	"MAX" , "MIN" , "AVG", "COUNT" , "SUM"
}



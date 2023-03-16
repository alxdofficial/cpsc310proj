import {MFields, SFields} from "../query/InsightQuery";
import {QueryGroup} from "./QueryGroup";

export class Transformation {
	public groups: QueryGroup;
	public applyRuleList: ApplyRule[] = [];
	constructor(groupKeys: QueryGroup, applylist: ApplyRule[]) {
		this.groups = groupKeys;
		this.applyRuleList = applylist;
	}

	public getGroupString(): string {
		let str: string = "";
		if (this.groups.groupKeys.length > 1) {
			str += "[";
		}
		for (let field of this.groups.groupKeys) {
			str += String(field) + ",";
		}
		str = str.slice(0, str.length - 1); // get rid of extra comma
		if (this.groups.groupKeys.length > 1) {
			str += "]";
		}
		return str;
	}


}

export class ApplyRule {
	public applyKey: string;
	public token: ApplyTokens;
	public key: MFields | SFields;
	constructor(token: ApplyTokens, key: MFields | SFields, applykey: string) {
		this.token = token;
		this.key = key;
		this.applyKey = applykey;
	}
}

export enum ApplyTokens {
	"MAX" , "MIN" , "AVG", "COUNT" , "SUM"
}



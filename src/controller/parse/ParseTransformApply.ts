import {QueryParser} from "./QueryParser";
import {InsightError} from "../IInsightFacade";
import {ApplyRule, ApplyTokens} from "../output/Transformation";
import {IDGetter} from "./IDGetter";
import {FieldGetter} from "./FieldGetter";
import {MFields, SFields} from "../query/InsightQuery";

export class ParseTransformApply {
	public static parseApply(json: any, parser: QueryParser, alreadyParsedApplyKeys: string[],
							 fieldsThatExistInOptions: Array<MFields | SFields>): Promise<ApplyRule[]> {
		return new Promise((resolve, reject) => {
			if (json["APPLY"] === undefined) {
				return reject(new InsightError("APPLY key misisng in query->transform"));
			} else {
				let applyClause = json["APPLY"];
				if (applyClause.length < 1) {
					return reject(new InsightError("apply rule list is empty in query->transform->apply"));
				}
				// create array of apply rules
				let applyRules: ApplyRule[] = [];
				for (let applyRule of applyClause) {
					this.parseApplyRule(applyRule, parser,alreadyParsedApplyKeys,
						fieldsThatExistInOptions).then((rule) => {
						applyRules.push(rule);
					}).catch((err) => {
						return reject(err);
					});
				}
				return resolve(applyRules);
			}
		});
	}

	public static parseApplyRule(applyRule: any, parser: QueryParser, alreadyParsedApplyKeys: string[],
								 fieldsThatExistInOptions: Array<MFields | SFields>): Promise<ApplyRule> {
		return new Promise((resolve, reject) => {
			// check if too many keys in json
			if (Object.keys(applyRule).length > 1) {
				return reject(new InsightError("too many json keys in query->tranform->apply[i]"));
			}
			// check the apply key is valid
			let applykey: string = Object.keys(applyRule)[0];
			if (!this.checkApplyKey(applykey, alreadyParsedApplyKeys)) {
				return reject(new InsightError("applykey is invalid in query->trnasform->apply[i]"));
			}
			// check apply rule body's apply token is valid
			let applybody = applyRule[applykey];
			if (Object.keys(applybody).length > 1 ) {
				return reject(new InsightError("too many apply tokens in query->transform->apply[i]-" +
					">applykey"));
			}
			// check apply token
			let tokenStr: string = Object.keys(applybody)[0];
			let applyTokenOrNull: ApplyTokens | null = this.getApplyToken(tokenStr);
			if (applyTokenOrNull === null) {
				return reject(new InsightError("apply tokens invalid in query->transform->" +
					"apply[i]->applytoken"));
			}
			let applyToken: ApplyTokens = applyTokenOrNull;
			// check the key
			return this.getKey(applybody[tokenStr],parser,fieldsThatExistInOptions).then((key) => {
				// all good
				return resolve(new ApplyRule(applyToken, key));
			}).catch((err) => {
				return reject(err);
			});
		});
	}

	public static checkApplyKey(key: string, alreadyParsedApplyKeys: string[]): boolean {
		return !(key.length < 1 || key.includes("_") || alreadyParsedApplyKeys.includes(key));
	}

	public static getApplyToken(token: string): ApplyTokens | null {
		switch (token) {
			case "MAX":
				return ApplyTokens.MAX;
			case"MIN":
				return ApplyTokens.MIN;
			case"AVG":
				return ApplyTokens.AVG;
			case"COUNT":
				return ApplyTokens.COUNT;
			case"SUM":
				return ApplyTokens.SUM;
			default:
				return null;
		}
	}

	public static getKey(keystr: string, parser: QueryParser,
						 fieldsThatExistInOptions: Array<MFields | SFields>): Promise<MFields | SFields> {
		// strip dataset id from key, checks if it references multipke datasets
		let keySansID: string | null = IDGetter.getID(keystr, parser);
		if (keySansID == null) {
			return Promise.reject(new InsightError("references multiple data" +
				"sets, query->transform->apply[i]->key"));
		}
		// check key references valid field in data entry
		let key: MFields | SFields | null = FieldGetter.getField(keySansID);
		if (key == null) {
			return Promise.reject(new InsightError("key references invalid data field in " +
				"query->transform->apply[i]->key"));
		}
		// check key exists in option->columns
		if (!fieldsThatExistInOptions.includes(key)) {
			return Promise.reject(new InsightError("key not included in option->column"));
		}
		return Promise.resolve(key);
	}
}

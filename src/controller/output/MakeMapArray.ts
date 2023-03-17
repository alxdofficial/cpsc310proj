import Section from "../Section";
import Room from "../Room";
import {QueryParser} from "../parse/QueryParser";
import {IDGetter} from "../parse/IDGetter";
import {MFields} from "../query/InsightQuery";
import {FieldGetter} from "../parse/FieldGetter";
import {GetFieldData} from "../query/GetFieldData";
import {TransformationHelpers} from "./TransformationHelpers";
import {ApplyRule, ApplyTokens, Transformation} from "./Transformation";
import e from "express";
import {unwatchFile} from "fs";
import {InsightError} from "../IInsightFacade";

export class MakeMapArray {
	public static makeMapArray(groupedResults: Map<string,
		Array<Section | Room>>, optionColumns: string[], parser: QueryParser, applyRules: ApplyRule[]):
		Promise<Array<Map<string, string | number>>> {
		return new Promise((resolve, reject) => {
			let array: Array<Map<string, string | number>> = [];
			for (let [groupKeyStr, entries] of groupedResults.entries()) {
				let map: Map<string, string | number> = new Map();
				// set option columns in map
				for (let column of optionColumns) {
					// getting the field might fail because columns may include apply keys, and thats ok we just ignore
					let field = FieldGetter.getOnlyField(column, parser);
					let val;
					if (field != null) {
						val = GetFieldData.getFieldData(entries[0], field);
					}
					if (val != null) {
						map.set(column, val);
					}
				}
				// set apply keys in map
				for (let applyRule of applyRules) {
					TransformationHelpers.helper(entries, applyRule.token, applyRule.key).then((applyResult) => {
						map.set(applyRule.applyKey, applyResult);
					}).catch((err) => {
						return reject(err);
					});
				}
				array.push(map);
			}
			return resolve(array);
		});
	}
}

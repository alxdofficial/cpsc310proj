import Section from "../Section";
import Room from "../Room";
import {InsightQuery} from "../query/InsightQuery";
import {Transformation} from "./Transformation";
import {QueryGroup} from "./QueryGroup";
import {GetFieldData} from "../query/GetFieldData";
import e from "express";
import {InsightError} from "../IInsightFacade";

export class MakeGroups {
	public static makeGroups(results: Array<Section | Room>,
							 query: InsightQuery): Promise<Map<string, Array<Section | Room>>> {
		// check if no transformations are specified, if so, all the results are just 1 big group,
		// with group key: 'TRIVIALGROUP'
		if (query.transformations === null) {
			let map = new Map();
			let groupKey: string = "TRIVIALGROUP";
			let outputArray: Array<Section | Room> = [];
			for (let result of results) {
				outputArray.push(result);
			}
			map.set(groupKey, outputArray);
			return Promise.resolve(map);
		} else {
			return this.makeGroupHelper(results, query.transformations.groups);
		}
	}

	private static makeGroupHelper(results: Array<Section | Room>,
								  grouping: QueryGroup): Promise<Map<string, Array<Section | Room>>> {
		return new Promise((resolve, reject) => {
			let hashmap: Map<string, Array<Section | Room>> = new Map();
			for (let result of results) {
				let key = this.getHashKey(result, grouping);
				if (key == null) {
					return reject(new InsightError("hashkey failed to compute when making groups"));
				}
				let arrInMap: Array<Section | Room> | undefined = hashmap.get(key);
				if (arrInMap === undefined) {
					hashmap.set(key, [result]);
				} else {
					arrInMap.push(result);
					hashmap.set(key, arrInMap);
				}
			}
			return resolve(hashmap);
		});
	}

	public static getHashKey(entry: Section | Room, grouping: QueryGroup): string | null {
		let hash: string = "";
		for (let groupKey of grouping.groupKeys) {
			let entryVal = GetFieldData.getFieldData(entry, groupKey);
			if (entryVal == null) {
				return null;
			}
			hash += String(entryVal) + ",";
		}
		hash = hash.slice(0, -1);
		return hash;
	}
}

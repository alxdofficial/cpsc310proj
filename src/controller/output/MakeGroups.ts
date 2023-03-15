import Section from "../Section";
import Room from "../Room";
import {InsightQuery} from "../query/InsightQuery";
import {Transformation} from "./Transformation";
import {QueryGroup} from "./QueryGroup";
import {GetFieldData} from "../query/GetFieldData";
import e from "express";

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
		let hashmap: Map<string, Array<Section | Room>> = new Map();
		let mapAccessPromisesArray = [];
		for (let result of results) {
			mapAccessPromisesArray.push(this.getHashKey(result, grouping).then((key) => {
				let arrInMap: Array<Section | Room> | undefined = hashmap.get(key);
				if (arrInMap === undefined) {
					hashmap.set(key, [result]);
				} else {
					arrInMap.push(result);
					hashmap.set(key, arrInMap);
				}
			}).catch((err) => {
				return Promise.reject(err);
			}));
		}
		return Promise.all(mapAccessPromisesArray).then(() => {
			return Promise.resolve(hashmap);
		}).catch((err) => {
			return Promise.reject(err);
		});
	}

	public static getHashKey(entry: Section | Room, grouping: QueryGroup): Promise<string> {
		let key: string = "(";
		return GetFieldData.getFieldData(entry, grouping.groupKeys[0]).then((res) => {
			key += String(res);
		}).then(() => {
			for (let i = 1; i < grouping.groupKeys.length; i++) {
				GetFieldData.getFieldData(entry, grouping.groupKeys[i]).then((res) => {
					key += "," + String(res);
				}).catch((err) => {
					return Promise.reject(err);
				});
			}
		}).then(() => {
			key += ")";
			return Promise.resolve(key);
		}).catch((err) => {
			return Promise.reject(err);
		});
	}
}

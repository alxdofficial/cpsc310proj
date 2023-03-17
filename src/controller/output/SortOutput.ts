import {InsightError} from "../IInsightFacade";
import {InsightSort} from "./InsightSort";

export class SortOutput {

	public static sort(arr: Array<Map<string, number | string>>,
					   sortConfig: InsightSort | null): Promise<Array<Map<string, number | string>>> {
		return new Promise((resolve, reject) => {
			// check if no order specified
			if (sortConfig == null) {
				return resolve(arr);
			}
			// check if we have empty or trivial array
			if (arr.length <= 1) {
				return resolve(arr);
			}
			// check the map for comparison
			if (!this.checkFieldsForSort(arr, sortConfig)) {
				return reject(new InsightError("incompatible fields in output map and order columns, a valid " +
					"comparison could not be made"));
			}
			arr.sort((mapA: Map<string, number | string>, mapB: Map<string, number | string>): number => {
				let res = 0;
				let i = 0;
				while (res === 0 && i < sortConfig.fields.length) {
					// check if comparing string or number
					if (typeof mapA.get(sortConfig.fields[i]) === "number") {
						let valA: number = Number(mapA.get(sortConfig.fields[i]));
						let valB: number = Number(mapB.get(sortConfig.fields[i]));
						if (valA < valB) {
							res = sortConfig.direction * -1;
						} else {
							res = sortConfig.direction * 1;
						}
					} else {
						let valA: string = String(mapA.get(sortConfig.fields[i]));
						let valB: string = String(mapB.get(sortConfig.fields[i]));
						res = sortConfig.direction * valA.localeCompare(valB);
					}
					i++;
				}
				return res;
			});
			return resolve(arr);
		});
	}

	public static checkFieldsForSort(arr: Array<Map<string, number | string>>, sortConfig: InsightSort): boolean {
		if (arr.length < 1) {
			return true;
		}
		let sampleMap = arr[0];
		let keys: string[] = Object.keys(sampleMap);
		for (let key of keys) {
			if (!sortConfig.fields.includes(key)){
				return false;
			}
		}
		return true;
	}
}

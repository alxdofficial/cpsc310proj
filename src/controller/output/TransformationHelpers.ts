import Section from "../Section";
import Room from "../Room";
import {ApplyTokens} from "./Transformation";
import {GetFieldData} from "../query/GetFieldData";
import {MFields, SFields} from "../query/InsightQuery";
import {InsightError} from "../IInsightFacade";

export class TransformationHelpers {
	public static helper(resultInGroup: Array<Section | Room>, token: ApplyTokens,
					  field: MFields | SFields): Promise<number> {
		return new Promise((resolve, reject) => {
			let val: number | undefined; // passed into helpers to calc min max and sum
			let count: number = 0; // unique counts of data values in group
			let alreadyExistingData: Array<string | number> = [];
			//
			for (let entry of resultInGroup) {
				let entryVal = GetFieldData.getFieldData(entry, field);
				// handle count
				if (entryVal == null) {
					return reject(new InsightError("retrieve data from entry failed in apply transformations"));
				}
				if (!alreadyExistingData.includes(entryVal)) {
					count++;
					alreadyExistingData.push(entryVal);
				}
				if (typeof entryVal !== "number" && token !== ApplyTokens.COUNT) {
					return reject(new InsightError("retrieve data from entry failed in apply transformations"));
				}
				// handle min, max, sum, avg
				val = this.minMaxSumHelper(val, entryVal, token);
			}
			if (val === undefined) {
				return reject(new InsightError("retrieve data from entry failed in apply transformations," +
					" result is underfined"));
			}
			if (token === ApplyTokens.MIN || token === ApplyTokens.MAX) {
				return resolve(val);
			} else if (token === ApplyTokens.SUM) {
				return resolve(Number(val.toFixed(2)));
			}else if (token === ApplyTokens.AVG) {
				let avg: number = val / resultInGroup.length;
				return resolve(Number(avg.toFixed(2)));
			} else if (token === ApplyTokens.COUNT) {
				return resolve(count);
			}
			return reject(new InsightError("doing transformation for a group failed because an" +
				" unexpected apply token found"));
		});
	}

	private static minMaxSumHelper(current: number | undefined, entryVal: number | string,
								   token: ApplyTokens): number {
		if (token === ApplyTokens.COUNT) {
			return 0;
		}
		if (typeof entryVal !== "number") {
			return 0;
		}
		if (current === undefined) {
			return entryVal;
		}
		switch (token) {
			case ApplyTokens.MAX:
				if (entryVal > current) {
					return entryVal;
				} else {
					return current;
				}
			case ApplyTokens.MIN:
				if (entryVal < current) {
					return entryVal;
				} else {
					return current;
				}
			case ApplyTokens.SUM:
			case ApplyTokens.AVG:
				return current + entryVal;
			default:
				console.log("unexpected apply token found");
				return 0;
		}
	}
}

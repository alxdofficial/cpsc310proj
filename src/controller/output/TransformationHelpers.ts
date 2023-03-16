import Section from "../Section";
import Room from "../Room";
import {ApplyTokens} from "./Transformation";
import {GetFieldData} from "../query/GetFieldData";
import {MFields, SFields} from "../query/InsightQuery";
import {InsightError} from "../IInsightFacade";

export class TransformationHelpers {
	public static helper(resultInGroup: Array<Section | Room>, token: ApplyTokens,
					  field: MFields | SFields): Promise<number> {
		let getDataPromises = [];
		let val: number | undefined; // passed into helpers to calc min max and sum
		let count: number = 0; // unique counts of data values in group
		let alreadyExistingData: number[] = [];
		for (let entry of resultInGroup) {
			getDataPromises.push(GetFieldData.getFieldData(entry, field).then((entryVal) => {
				if (!(typeof entryVal === "number")) {
					return Promise.reject(new InsightError("type is not number when trying to do transformation"));
				}
				// handle min, max, sum, avg
				val = this.minMaxSumHelper(val, entryVal, token);
				// handle count
				if (!alreadyExistingData.includes(entryVal)) {
					count++;
					alreadyExistingData.push(entryVal);
				}
			}).catch((err) => {
				return Promise.reject(err);
			}));
		}
		return Promise.all(getDataPromises).then(() => {
			if (!(typeof val === "number")) {
				return Promise.reject(new InsightError("value calulated in transformation of not of type number"));
			}
			let numVal: number = val;
			if (token === ApplyTokens.SUM || token === ApplyTokens.MIN || token === ApplyTokens.MAX) {
				return Promise.resolve(numVal);
			} else if (token === ApplyTokens.AVG) {
				return Promise.resolve(numVal / resultInGroup.length);
			} else if (token === ApplyTokens.COUNT) {
				return Promise.resolve(count);
			}
			return Promise.reject(new InsightError("doing transformation for a group failed because an" +
				" unexpected apply token found"));
		}).catch((err) => {
			return Promise.reject(err);
		});
	}

	private static minMaxSumHelper(current: number | undefined, entryVal: number, token: ApplyTokens): number {
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
			case ApplyTokens.COUNT:
				return 0;
			default:
				console.log("unexpected apply token found");
				return 0;
		}
	}
}

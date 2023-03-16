import Section from "../Section";
import Room from "../Room";
import {ApplyTokens} from "./Transformation";
import {GetFieldData} from "../query/GetFieldData";
import {MFields, SFields} from "../query/InsightQuery";
import {InsightError} from "../IInsightFacade";
import e from "express";

export class TransformationHelpers {
	public static helper(resultInGroup: Array<Section | Room>, token: ApplyTokens,
					  field: MFields | SFields): Promise<number> {
		return new Promise((resolve, reject) => {
			let val: number | undefined; // passed into helpers to calc min max and sum
			let count: number = 0; // unique counts of data values in group
			let alreadyExistingData: number[] = [];
			//
			for (let entry of resultInGroup) {
				let entryVal = GetFieldData.getFieldData(entry, field);
				if (entryVal == null || typeof entryVal !== "number") {
					return reject(new InsightError("retrieve data from entry failed in apply transformations"));
				}
				// handle min, max, sum, avg
				val = this.minMaxSumHelper(val, entryVal, token);
				// handle count
				if (!alreadyExistingData.includes(entryVal)) {
					count++;
					alreadyExistingData.push(entryVal);
				}
			}
			// check the calculated val is valid
			if (!(typeof val === "number")) {
				return reject(new InsightError("value calulated in transformation of not of type number"));
			}
			let numVal: number = val;
			if (token === ApplyTokens.SUM || token === ApplyTokens.MIN || token === ApplyTokens.MAX) {
				return resolve(numVal);
			} else if (token === ApplyTokens.AVG) {
				return resolve(numVal / resultInGroup.length);
			} else if (token === ApplyTokens.COUNT) {
				return resolve(count);
			}
			return reject(new InsightError("doing transformation for a group failed because an" +
				" unexpected apply token found"));
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

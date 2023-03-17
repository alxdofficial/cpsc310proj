import Section from "../Section";
import Room from "../Room";
import {ApplyTokens} from "./Transformation";
import {GetFieldData} from "../query/GetFieldData";
import {MFields, SFields} from "../query/InsightQuery";
import {InsightError} from "../IInsightFacade";
import Decimal from "decimal.js";

export class TransformationHelpers {
	public static helper(resultInGroup: Array<Section | Room>, token: ApplyTokens,
					  field: MFields | SFields): Promise<number> {
		switch (token) {
			case ApplyTokens.MIN:
				return this.minHelper(resultInGroup, field);
			case ApplyTokens.MAX:
				return this.maxHelper(resultInGroup, field);
			case ApplyTokens.SUM:
				return this.sumHelper(resultInGroup, field);
			case ApplyTokens.AVG:
				return this.avgHelper(resultInGroup, field);
			case ApplyTokens.COUNT:
				return this.countHelper(resultInGroup, field);
		}
	}

	private static minHelper(entries: Array<Section | Room>, field: MFields | SFields): Promise<number> {
		let min: number = Infinity;
		for (let entry of entries) {
			let entryVal = GetFieldData.getFieldData(entry, field);
			if (entryVal == null || typeof entryVal !== "number") {
				return Promise.reject(new InsightError("expect mfield in transformation but got s field"));
			}
			if (entryVal < min) {
				min = entryVal;
			}
		}
		return Promise.resolve(min);
	}

	public static maxHelper(entries: Array<Section | Room>, field: MFields | SFields): Promise<number>{
		let max: number = -Infinity;
		for (let entry of entries) {
			let entryVal = GetFieldData.getFieldData(entry, field);
			if (entryVal == null || typeof entryVal !== "number") {
				return Promise.reject(new InsightError("expect mfield in transformation but got s field"));
			}
			if (entryVal > max) {
				max = entryVal;
			}
		}
		return Promise.resolve(max);
	}

	public static sumHelper(entries: Array<Section | Room>, field: MFields | SFields): Promise<number> {
		let sum: number = Infinity;
		for (let entry of entries) {
			let entryVal = GetFieldData.getFieldData(entry, field);
			if (entryVal == null || typeof entryVal !== "number") {
				return Promise.reject(new InsightError("expect mfield in transformation but got s field"));
			}
			sum += entryVal;
		}
		return Promise.resolve(Number(sum.toFixed(2)));
	}

	public static avgHelper(entries: Array<Section | Room>, field: MFields | SFields): Promise<number> {
		let sum: Decimal = new Decimal(0);
		for (let entry of entries) {
			let entryVal = GetFieldData.getFieldData(entry, field);
			if (entryVal == null || typeof entryVal !== "number") {
				return Promise.reject(new InsightError("expect mfield in transformation but got s field"));
			}
			let decimal = new Decimal(entryVal);
			sum = sum.add(decimal);
		}
		let avg = sum.toNumber() / entries.length;
		return Promise.resolve(Number(avg.toFixed(2)));
	}

	public static countHelper(entries: Array<Section | Room>, field: MFields | SFields): Promise<number> {
		let existing: Array<string | number | null> = [];
		let count = 0;
		for (let entry of entries) {
			let entryVal = GetFieldData.getFieldData(entry, field);
			if (!existing.includes(entryVal)) {
				existing.push(entryVal);
				count++;
			}
		}
		return Promise.resolve(count);
	}
}

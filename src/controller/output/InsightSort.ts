import Room from "../Room";
import Section from "../Section";
import {MFields, SFields} from "../query/InsightQuery";
import {GetFieldData} from "../query/GetFieldData";
import {MorSField} from "../query/MorSField";
import e from "express";

export class InsightSort {
	public direction: Dir;
	public fields: Array<MFields | SFields | string>;
	constructor(dir: Dir, fields: string[]) {
		this.direction = dir;
		this.fields = fields;
	}

	// assume entry A and B are of same type at this point because a call to checkFieldFOrSort have been made
	// public sortFn = (entryA: Room | Section, entryB: Room | Section): number => {
	// 	let res: number = 0;
	// 	let i = 0;
	// 	let promiseArr: Array<Promise<void>> = [];
	// 	while (i < this.fields.length && res === 0 && promiseArr.length !== 0) {
	// 		let valA: number | string;
	// 		let valB: number | string;
	// 		promiseArr.push(GetFieldData.getFieldData(entryA, this.fields[i]).then((val) => {
	// 			valA = val;
	// 		}));
	// 		promiseArr.push(GetFieldData.getFieldData(entryB, this.fields[i]).then((val) => {
	// 			valB = val;
	// 		}));
	// 		Promise.all(promiseArr).then(() => {
	// 			if (MorSField.MorSField(this.fields[i]) === "m") {
	// 				// compare m field
	// 				if (valA < valB) {
	// 					res = this.direction * -1;
	// 				} else {
	// 					i++;
	// 					promiseArr.pop();
	// 					promiseArr.pop();
	// 				}
	// 			} else {
	// 				// compare s field
	// 				let strComp: number = String(valA).localeCompare(String(valB));
	// 				if (strComp !== 0) {
	// 					res = this.direction * strComp;
	// 				} else {
	// 					i++;
	// 					promiseArr.pop();
	// 					promiseArr.pop();
	// 				}
	// 			}
	// 		});
	// 	}
	// 	return res;
	// };

}


export enum Dir {
	"up"= 1, "down"= -1
}


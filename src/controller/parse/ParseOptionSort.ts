import {MFields, SFields} from "../query/InsightQuery";
import {QueryParser} from "./QueryParser";
import {IDGetter} from "./IDGetter";
import {FieldGetter} from "./FieldGetter";
import {InsightError} from "../IInsightFacade";
import {Dir, InsightSort} from "../output/InsightSort";
import e from "express";

export class ParseOptionSort {
	public static parseOptionOrder(json: any, optionColumns: Array<MFields | SFields | string>,
								   parser: QueryParser): Promise<InsightSort | null> {
		return new Promise((resolve, reject) => {
			// check an ORDER is specified
			let order: InsightSort | null = null;
			if (json["ORDER"] !== undefined) {
				let orderClause = json["ORDER"];
				// check if we have simple order
				if (typeof json["ORDER"] === "string") {
					if (optionColumns.includes(orderClause)) {
						order = new InsightSort(Dir.up, [orderClause]);
						return resolve(order);
					} else {
						return reject(new InsightError("order column is not included in output column"));
					}
				} else {
					return this.complexOrderHelper(orderClause, optionColumns, parser).then((res) => {
						return resolve(res);
					}).catch((err) => {
						return reject(err);
					});
				}
			}
			return resolve(null);
		});
	}

	private static complexOrderHelper(orderClause: any, optionColumns: string[],
									  parser: QueryParser): Promise<InsightSort> {
		return new Promise((resolve, reject) => {
			// parse direction
			let dirStr = orderClause["dir"];
			if (dirStr === undefined) {
				return reject(new InsightError("dir in query->option->order->dir parsed error"));
			}
			let dir: Dir;
			if (dirStr === "UP") {
				dir = Dir.up;
			} else if (dirStr === "DOWN") {
				dir = Dir.down;
			} else {
				return reject(new InsightError("dir in query->option->order->dir parsed error"));
			}
			// parse fields
			let fieldstrs = orderClause["keys"];
			if (fieldstrs.length < 1) {
				return reject(new InsightError("keys in query->option->order->keys has no keys"));
			}
			let fields: string[] = [];
			for (let fieldStr of fieldstrs) {
				if (optionColumns.includes(fieldStr)) {
					fields.push(fieldStr);
				} else {
					return reject(new InsightError("keys in query->option->order->keys not " +
						"included in option->columns"));
				}
			}
			return resolve(new InsightSort(dir, fields));
		});
	}
}

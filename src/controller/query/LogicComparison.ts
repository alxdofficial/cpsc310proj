import Section from "../Section";
import {rejects} from "assert";
import {InsightError} from "../IInsightFacade";
import {InsightFilter} from "./IInsightFilter";
import Room from "../Room";

export enum Logic {And, Or}

export class LogicComparison implements InsightFilter {
	public logic: Logic;
	public filterList: InsightFilter[];
	constructor(logic: Logic, filterList: InsightFilter[]) {
		this.logic = logic;
		this.filterList = filterList;
	}

	public doFilter(entry: Section | Room): Promise<boolean> {
		return new Promise((resolve, reject) => {
			let promises = [];
			if (this.logic === Logic.And) {
				let pred = true;
				for (let filter of this.filterList) {
					promises.push(filter.doFilter(entry).then((res) => {
						pred = (pred && res);
					}).catch((err) => {
						return reject(err);
					}));
				}
				return Promise.all(promises).then((res) => {
					return resolve(pred);
				});
			} else if (this.logic === Logic.Or) {
				let pred = false;
				for (let filter of this.filterList) {
					promises.push(filter.doFilter(entry).then((res) => {
						pred = (pred || res);
					}).catch((err) => {
						return reject(err);
					}));
				}
				return Promise.all(promises).then((res) => {
					return resolve(pred);
				});
			}
		});
	}
}

import Section from "../Section";
import Room from "../Room";
import {QueryGroup} from "./QueryGroup";
import {ApplyRule, ApplyTokens, Transformation} from "./Transformation";
import {TransformationHelpers} from "./TransformationHelpers";

export class ApplyTransformation {
	public static applyTransformation(groupedResults: Map<string,
		Array<Section | Room>>, transformation: Transformation):
		Promise<Array<Map<string, (string | number | Array<Section | Room>)>>> {
		if (transformation.applyRuleList.length === 0) {
			let output: Array<Map<string, (string | number | Array<Section | Room>)>> = [];
			for (let group of groupedResults.entries()) {
				let entry: Map<string, (string | Array<Section | Room>)> = new Map();
				entry.set(transformation.getGroupString(), group[0]);
				entry.set("entries", group[1]);
				output.push(entry);
			}
			return Promise.resolve(output);
		} else {
			let output: Array<Map<string, number | string>> = [];
			let groupPromises = [];
			for (let group of groupedResults.entries()) {
				groupPromises.push(new Promise((resolve, reject) => {
					let entry = new Map();
					entry.set(transformation.getGroupString(),group[0]);
					let helperPromises = [];
					for (let applyRule of transformation.applyRuleList) {
						helperPromises.push(TransformationHelpers.helper(group[1], applyRule.token,
							applyRule.key).then((res) => {
							entry.set(applyRule.applyKey, res);
						}).catch((err) => {
							return reject(err);
						}));
					}
					Promise.all(helperPromises).then(() => {
						output.push(entry);
						return resolve(1);
					});
				}));
			}
			return Promise.all(groupPromises).then(() => {
				return Promise.resolve(output);
			}).catch((err) => {
				return Promise.reject(err);
			});
		}
	}


}

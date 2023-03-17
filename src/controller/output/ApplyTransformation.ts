import Section from "../Section";
import Room from "../Room";
import {QueryGroup} from "./QueryGroup";
import {ApplyRule, ApplyTokens, Transformation} from "./Transformation";
import {TransformationHelpers} from "./TransformationHelpers";
import {QueryParser} from "../parse/QueryParser";
import e from "express";
import {MakeMapArray} from "./MakeMapArray";

export class ApplyTransformation {
	public static applyTransformation(groupedResults: Map<string,
		Array<Section | Room>>, transformation: Transformation | null, parser: QueryParser, optionColumns: string[]):
		Promise<Array<Map<string, string | number>>> {
		if (transformation == null) {
			return MakeMapArray.makeMapArray(groupedResults,optionColumns,parser, []);
		} else {
			return MakeMapArray.makeMapArray(groupedResults,optionColumns,parser,transformation.applyRuleList);
		}
	}
}

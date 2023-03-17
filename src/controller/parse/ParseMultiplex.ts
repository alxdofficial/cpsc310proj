import {ParseLogic} from "./ParseLogic";
import {ParseM} from "./ParseM";
import {ParseN} from "./ParseN";
import {ParseS} from "./ParseS";
import {QueryParser} from "./QueryParser";
import {InsightError} from "../IInsightFacade";
import {InsightFilter} from "../query/IInsightFilter";
import {Logic} from "../query/LogicComparison";
import {InsightM} from "../query/MComparison";

export class ParseMultiplex {
	public static multiplexInput(key: string, json: any, parser: QueryParser): Promise<InsightFilter> {
		switch (key) {
			case "AND":
				return ParseLogic.logicHelper(Logic.And, json, parser); // FIXME i think these should all be return resolve
			case "OR":
				return ParseLogic.logicHelper(Logic.Or, json, parser);
			case "LT":
				return ParseM.MHelper(InsightM.lt, json, parser);
			case "GT":
				return ParseM.MHelper(InsightM.gt, json, parser);
			case "EQ":
				return ParseM.MHelper(InsightM.eq, json, parser);
			case "IS":
				return ParseS.SHelper(json, parser);
			case "NOT":
				return ParseN.NHelper(json, parser);
			default:
				// unrecognized key
				return Promise.reject(new InsightError("unrecognized filter key: " + key));
		}
	}
}

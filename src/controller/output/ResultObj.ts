import {InsightResult} from "../IInsightFacade";

export class ResultObj implements InsightResult {
	[key: string]: string | number;
}

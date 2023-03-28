import {InsightError} from "../IInsightFacade";
import InsightFacade from "../InsightFacade";
import {InsightQuery} from "../query/InsightQuery";
import {InsightFilter} from "../query/IInsightFilter";
import {ParseWhere} from "./ParseWhere";
import {ParseOption} from "./ParseOption";
import {InsightOption} from "../output/InsightOption";
import {ParseTransform} from "./ParseTransform";
import {Transformation} from "../output/Transformation";
// stores persistant information specific to each query, this object is passed into parsing helpers to help detect
// errors like referencing multiple datasets
export class QueryParser {
	private readonly inputJson: any;
	private readonly facade: InsightFacade;
	public dataset_id: string = "";
	constructor(input: any, facade: InsightFacade) {
		this.inputJson = input;
		this.facade = facade;
	}

	public getQuery(): Promise<InsightQuery> { // any is just a stub for now
		return new Promise((resolve,reject) => {
			try {
				let filter: InsightFilter;
				let option: InsightOption;
				if (Object.keys(this.inputJson).length <= 3) {
					return ParseWhere.parseWhere(this.inputJson, this).then((fil) => {
						filter = fil;
					}).then(() => {
						return ParseOption.parseOptions(this.inputJson, this);
					}).then((opt) => {
						option = opt;
						return ParseTransform.parseTransform(this.inputJson, this, option.columns);
					}).then((transform: Transformation | null) => {
						// everything parsed successfully, so we just create insight query object and return it
						return resolve(new InsightQuery(filter, option, transform, this.dataset_id, this.facade));
					}).catch((err) => {
						return reject(err);
					});
				} else {
					return reject(new InsightError("wrong number of keys in input"));
				}
			} catch(err) {
				return reject(new InsightError());
			}
		});
	}
}

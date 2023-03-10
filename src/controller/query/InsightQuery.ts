import Section from "../Section";
import InsightFacade from "../InsightFacade";
import {InsightDataset, InsightError, InsightResult, ResultTooLargeError} from "../IInsightFacade";
import Room from "../Room";
import {GetDataset} from "./GetDataset";
import {InsightFilter} from "./IInsightFilter";
import {InsightOption} from "../output/InsightOption";
import {InsightTransformation} from "../output/InsightTransformation";


export class InsightQuery {
	private id: string;
	public body: InsightFilter;
	public options: InsightOption;
	public transformations: InsightTransformation;
	private facade: InsightFacade;
	constructor(inputBody: InsightFilter, inputOptions: InsightOption,
		inputTransformations: InsightTransformation, id: string, facade: InsightFacade) {
		console.log("new instance of insight query");
		this.body = inputBody;
		this.options = inputOptions;
		this.id = id;
		this.facade = facade;
		this.transformations = inputTransformations;
	}

	public async doQuery(): Promise<Array<Section | Room>> {
		// the query promise
		return new Promise((resolve, reject) => {
			return GetDataset.getDataset(this.facade, this.id).then((data) => {
				let qualifyingResults: Array<Section | Room> = [];
				for (let entry of data) {
					this.body.doFilter(entry).then((addPred: boolean) => {
						if (addPred) {
							qualifyingResults.push(entry);
						}
					}).catch((err: InsightError) => {
						return reject(err);
					});
				}
				// check if too many results
				if (qualifyingResults.length > 5000) {
					return reject(new ResultTooLargeError());
				}
				return resolve(qualifyingResults);
			});
		});
	}
}

export enum MFields { avg="avg",pass="pass",fail="fail",audit="audit",year="year",lat="lat",lon="lon",seats="seats"}
export enum SFields { dept="dept",id="id",instructor="instructor",title="title",uuid="uuid",
	fullname="fullname",shortname="shortname",number="number",name="name",
	address="address",type="type",furniture="furniture",href="href"}



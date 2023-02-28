import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import Section from "./Section";
import fs from "fs-extra";

export class Dataset {
	private readonly datasetIDs: string[];
	// datasetIDs is string[]
	// interp. an array of the currently added datasetIDs
	private readonly datasets: Map<InsightDataset, Section[]>;
	// datasets is one of: InsightDataset, Section[]
	// interp. an InsightDataset associated with the sections within it.

	private sectionArr: Section[];														// Push all the sections into an array, then push the array into the hashmap
	private rowCount: number;															// The count of valid sections in this dataset, 0 then throw insight error, otherwise pass
	private id: string;
	private content: string;
	private kind: InsightDatasetKind;

	constructor(datasetIDs: string[], datasets: Map<InsightDataset, Section[]>, sectionArr: Section[]
		, rowCount: number, id: string, content: string, kind: InsightDatasetKind) {
		this.datasetIDs = datasetIDs;
		this.datasets = datasets;
		this.sectionArr = sectionArr;
		this.rowCount = rowCount;
		this.id = id;
		this.content = content;
		this.kind = kind;
	}

	public getDatasetIDs(): string[] {
		return this.datasetIDs;
	}

	public getDatasets(): Map<InsightDataset, Section[]> {
		return this.datasets;
	}

	public getSectionArr(): Section[] {
		return this.sectionArr;
	}

	public getRowCount(): number {
		return this.rowCount;
	}

	public getID(): string {
		return this.id;
	}

	public getContent(): string {
		return this.content;
	}

	public getKind(): InsightDatasetKind {
		return this.kind;
	}

	public setID(id: string) {
		this.id = id;
	}

	public setRowCount(rowCount: number) {
		this.rowCount = rowCount;
	}

	public setSectionArr(arr: Section[]) {
		this.sectionArr = arr;
	}

	public async writeData() {
		const localMap = Object.fromEntries(this.datasets);				// Read the map into a JS object for JSON.stringify
		const jsonString = JSON.stringify(localMap);				    // Read the dataset array into JSON, push that into save
		const jsonObj = JSON.parse(jsonString);
		jsonObj.sectionArr = this.sectionArr;
		jsonObj.id = this.id;
		jsonObj.kind = this.kind.toString();
		jsonObj.numRows = this.rowCount;
		const jsonObjToString = JSON.stringify(jsonObj);
		await fs.appendFile("./data/" + this.id + ".json", jsonObjToString); 	// Add the file
	}
}

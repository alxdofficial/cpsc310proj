import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";

import fs from "fs-extra";
import JSZip from "jszip";
import Section from "./datasetProcessor/Section";
import Room from "./datasetProcessor/Room";
// import {InsightQuery} from "./InsightQuery"; // TODO undome
import {DataProcessor} from "./datasetProcessor/DataProcessor";
import {Dataset} from "./datasetProcessor/Dataset";
import {AddRoom} from "./datasetProcessor/AddRoom";
import {AddSection} from "./datasetProcessor/AddSection";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private readonly datasetIDs: string[];
	// datasetIDs is string[]
	// interp. an array of the currently added datasetIDs
	private readonly datasets: Map<InsightDataset, Array<Section | Room>>;
	// datasets is one of: InsightDataset, Section[]
	// interp. an InsightDataset associated with the sections within it.

	private sectionArr: Section[];														// Push all the sections into an array, then push the array into the hashmap
	private roomArr: Room[];
	private rowCount: number;															// The count of valid sections in this dataset, 0 then throw insight error, otherwise pass

	constructor() {
		this.datasetIDs = [];															// Initialize an empty array of strings that will contain the currently added Dataset IDs
		this.datasets = new Map();
		this.sectionArr = [];
		this.roomArr = [];
		this.rowCount = 0;
		this.crashRecovery();
	}


	public crashRecovery() {
		if (!this.checkDataExists()) { // If data folder is empty, don't do anything
			return;
		}
		const packageObj = fs.readdirSync("./data");
		for (let key of packageObj) {
			const file = fs.readFileSync("./data/" + key, "utf-8");
			const jsonString = JSON.parse(file);
			let insightKind: InsightDatasetKind = InsightDatasetKind.Sections; // init as sections
			if (jsonString.kind === "sections") {
				insightKind = InsightDatasetKind.Sections;
				this.recoverSections(jsonString, insightKind);
			} else if (jsonString.kind === "rooms") {
				insightKind = InsightDatasetKind.Rooms;
				this.recoverRooms(jsonString, insightKind);
			}
		}
	}

	public recoverSections(jsonString: any, insightKind: InsightDatasetKind) {
		const newDataset: InsightDataset =
			{
				id: jsonString.id,
				kind: insightKind,
				numRows: jsonString.numRows
			};
		for (const str of jsonString.sectionArr) {
			let toPush: Section = new Section(str.uuid, str.id, str.title, str.instructor,
				str.dept, str.year, str.avg, str.pass, str.fail, str.audit);
			this.sectionArr.push(toPush);
		}
		this.datasets.set(newDataset, this.sectionArr);
		this.datasetIDs.push(jsonString.id);
		this.sectionArr = []; // clean up the section array every time
	}

	public recoverRooms(jsonString: any, insightKind: InsightDatasetKind) {
		const newDataset: InsightDataset =
			{
				id: jsonString.id,
				kind: insightKind,
				numRows: jsonString.numRows
			};
		for (const str of jsonString.roomArr) {
			let toPush: Room = new Room(str.fullname, str.shortname, str.number, str.name, // TODO IMPLEMENT ME
				str.address, str.lat, str.lon, str.seats, str.type, str.furniture, str.href);
			this.roomArr.push(toPush);
		}
		this.datasets.set(newDataset, this.roomArr);
		this.datasetIDs.push(jsonString.id);
		this.roomArr = []; // clean up the room array every time
	}

	public checkDataExists(): boolean {
		return fs.existsSync("./data"); // does the data file exist?
	}

	// REQUIRES: An ID as a string, Content in base64 string, a dataset kind
	// MODIFIES: this.datasets, this.sectionArr and this.rowcount
	// EFFECTS: reads the content of the data source and reads it into memory and disk
	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (this.invalidID(id)) {														// Check that the id is valid
			return Promise.reject(new InsightError("Invalid ID!"));
		}
		if (this.duplicateID(id)) {														// Check that there isn't a dataset already added with the same ID
			return Promise.reject(new InsightError("Duplicate ID!"));
		}
		let dataset: Dataset = new Dataset(this.datasetIDs, this.datasets, this.sectionArr, this.roomArr,
			this.rowCount, id, content, kind);

		if (kind === InsightDatasetKind.Rooms) {
			let roomAdder: DataProcessor = new AddRoom();
			return Promise.resolve(roomAdder.addOnKind(dataset));
		} else if (kind === InsightDatasetKind.Sections) {
			let roomAdder: DataProcessor = new AddSection();
			return Promise.resolve(roomAdder.addOnKind(dataset));
		}
		return Promise.reject(new InsightError());
	}

	// REQUIRES: N/A
	// MODIFIES: N/A
	// EFFECTS: returns the map of all the insightdatasets as keys and all section objects in an array
	public getAllDatasets(): Map<InsightDataset, Array<Section | Room>> {
		return this.datasets;
	}

	// REQUIRES: a string that represents the dataset ID
	// MODIFIES: N/A
	// EFFECTS: checks the ID string if it is valid or not
	public invalidID(id: string): boolean {
		try {
			if (id.includes("_")) {  														// If it has an underscore, return false
				return true;
			} else if (id === "") {  														// If it is only the empty string,
				return true;
			} else if (!id.replace(/\s/g, "").length) { 				// https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
				return true;																// If the string length after removing all spaces is 0 ie: only spaces
			}
		} catch (e) {																		// If for some reason the argument passed is not a string, throw an InsightError
			throw new InsightError();
		}
		return false;																		// Otherwise, return true
	}

	// REQUIRES: a string that represents the dataset ID
	// MODIFIES: N/A
	// EFFECTS: checks the current list of dataset IDs for the given, return true if exists, return false otherwise.
	public duplicateID(id: string): boolean {
		for (const item of this.datasetIDs) {												// Iterate over the list of dataset ids, if contains current then return true, other wise return false
			if (item === id) {
				return true;
			}
		}
		return false;
	}

	// REQUIRES: an ID
	// MODIFIES: N/A
	// EFFECTS: Removes the JSON representation of sections in a dataset from the data folder
	public removeDataset(id: string): Promise<string> {
		if (this.invalidID(id)) {															// Check that the id is valid
			return Promise.reject(new InsightError("Invalid ID!"));
		}
		if (!(this.datasetIDs.includes(id))) {												// Check that a valid data set was added with the key
			return Promise.reject(new NotFoundError("ID Doesn't exist"));
		}
		for (const insightDataset of this.datasets.keys()) {								// Otherwise, will reach this condition and resolve
			if (insightDataset.id === id) {
				this.datasets.delete(insightDataset);										// Delete the <K,V> pair from the map with this key, clears from memory
				this.datasetIDs.splice(this.datasetIDs.indexOf(id), 1); 			// Delete the ID from the ID list, clears from memory
				fs.removeSync("./data/" + id.toString());								// Synchronously remove the dataset with the id in the ./data folder, clears from disk
				return Promise.resolve(id.toString()); 										// after success
			}
		}
		return Promise.reject(new InsightError("Some other error occurred")); 				// If not invalid, does exist but isn't in loop, throw this error
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		// return new Promise<InsightResult[]>((resolve, reject) => {
		// 	const newParser: QueryParser = new QueryParser(query, this);
		// 	newParser.getQuery().then(function (returnedQuery: InsightQuery) {
		// 		return returnedQuery.doQuery().then((result) => {
		// 			return resolve(result);
		// 		}).catch((err) => {
		// 			return reject(err);
		// 		});
		// 	}).catch((err: InsightError | NotFoundError) => {
		// 		return reject(err);
		// 	});
		// });

		return Promise.reject(new InsightError()); // TODO undo me
	}

	public listDatasets(): Promise<InsightDataset[]> {		// Settling this promise: This promise only fufills, either an empty array or array of current datasets
		let result: InsightDataset[] = []; 					// Create a new temporary array, cannot return the keyset as it is an iterator
		for (const key of this.datasets.keys()) { 			// Iterate over the keyset, adding each key to the array
			result.push(key);
		}
		return Promise.resolve(result);          			// Return the list
	}
}

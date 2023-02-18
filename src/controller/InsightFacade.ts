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
import Section from "./Section";
import {QueryParser} from "./ParseQuery";
import {InsightQuery} from "./InsightQuery";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private readonly datasetIDs: string[];
	// datasetIDs is string[]
	// interp. an array of the currently added datasetIDs
	private readonly datasets: Map<InsightDataset, Section[]>;
	// datasets is one of: InsightDataset, Section[]
	// interp. an InsightDataset associated with the sections within it.


	private sectionArr: Section[];														// Push all the sections into an array, then push the array into the hashmap
	private rowCount: number;															// The count of valid sections in this dataset, 0 then throw insight error, otherwise pass


	constructor() {
		this.datasetIDs = [];															// Initialize an empty array of strings that will contain the currently added Dataset IDs
		this.datasets = new Map();
		this.sectionArr = [];
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
			} else if (jsonString.kind === "rooms") {
				insightKind = InsightDatasetKind.Rooms;
			}
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
			this.sectionArr = []; // clean up the section array every time
		}
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
		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Rooms is not valid for this checkpoint!"));
		}
		return new Promise((resolve, reject) => {
			try {
				fs.mkdir("./data").catch(() => { 									// Create the ./data directory that clearDisk() clears on each run, push dataset representations into this file
					return Promise.reject(new InsightError("Creating ./data failed!"));
				});
				const JSzip = new JSZip();
				JSzip.loadAsync(content, {base64: true, checkCRC32: true})        // is loaded even if its invalid
					.then(async (zip) => {
						await this.iterateFolders(zip);									// Iterate over the files, modifiy the class variables
						if (this.rowCount === 0) {
							throw new InsightError("No valid sections!");
						}
						const newDataSet: InsightDataset = {							// Create the dataset tuple
							id: id,
							kind: kind,
							numRows: this.rowCount
						};
						this.datasets.set(newDataSet, this.sectionArr); 				// Add the insightdataset and section array to the in memory representation of the data
						this.datasetIDs.push(id); 										// on successful add, add the datasetID

						await this.writeData(id, kind);									// Write to the disk

						this.rowCount = 0;												// CLEANUP: reset row count for future add calls
						this.sectionArr = []; 											// CLEANUP: empty the array for sections for future calls
						return resolve(this.datasetIDs); 								// resolve with an array of strings which are the added IDs
					}
					)
					.catch((error) => {
						return reject(new InsightError(error));
					});
			} catch (e) {
				return reject(new InsightError());
			}
		});
	}

	// REQUIRES: N/A
	// MODIFIES: N/A
	// EFFECTS: returns the map of all the insightdatasets as keys and all section objects in an array
	public getAllDatasets(): Map<InsightDataset, Section[]> {
		return this.datasets;
	}

	public async writeData(id: string, kind: InsightDatasetKind) {
		const localMap = Object.fromEntries(this.datasets);				// Read the map into a JS object for JSON.stringify
		const jsonString = JSON.stringify(localMap);				    // Read the dataset array into JSON, push that into save
		const jsonObj = JSON.parse(jsonString);
		jsonObj.sectionArr = this.sectionArr;
		jsonObj.id = id;
		jsonObj.kind = kind.toString();
		jsonObj.numRows = this.rowCount;
		const jsonObjToString = JSON.stringify(jsonObj);
		await fs.appendFile("./data/" + id + ".json", jsonObjToString); 	// Add the file
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
	// REQUIRES: a JSON stringified string
	// MODIFIES: N/A
	// EFFECTS: parses the string as a JSON object, creates a section object with the fields.
	public parseJSON(t: string) {
		let localSectionArr: Section[] = [];
		const result = JSON.parse(t).result; 		 	// Result is the array of the JSON objects

		for (const jsonObject of result) {			 	// Each JSON object is one whole section in result, check if key is undefined
			if (this.fieldIsUndefined(jsonObject)) {  	// Check all the fields of the current JSON object, if any required field is missing skip this object
				continue;
			}
			let toAdd: Section = new Section(jsonObject.id, jsonObject.Course,
				jsonObject.Title, jsonObject.Professor, jsonObject.Subject,
				jsonObject.Year, jsonObject.Avg, jsonObject.Pass, jsonObject.Fail, jsonObject.Audit);   // Create a new section
			localSectionArr.push(toAdd); 					// Create a section object in one iteration, push it to the array
			this.rowCount++;								// Increment the count of valid sections, "numRows is the number of valid sections in a dataset" @480
		}
		this.sectionArr.push(...localSectionArr);
	}
	// REQUIRES: a JSON object
	// MODIFIES: N/A
	// EFFECTS: reads all the fields and checks if the required fields are undefined.
	//          undefined, signal to skip the iteration
	public fieldIsUndefined(jsonObject: any): boolean {
		if (jsonObject.id === undefined) {
			return true;
		} else if (jsonObject.Course === undefined) {
			return true;
		} else if (jsonObject.Title === undefined) {
			return true;
		} else if (jsonObject.Professor === undefined) {
			return true;
		} else if (jsonObject.Subject === undefined) {
			return true;
		} else if (jsonObject.Year === undefined) {
			return true;
		} else if (jsonObject.Avg === undefined) {
			return true;
		} else if (jsonObject.Pass === undefined) {
			return true;
		} else if (jsonObject.Fail === undefined) {
			return true;
		} else if (jsonObject.Audit === undefined) {
			return true;
		}
		return false;
	}
	// REQUIRES: a JSZip object, ID of the set and kind
	// MODIFIES: N/A
	// EFFECTS: Queues all the file reads and pushes into a promise array,
	//			executes promise.all and awaits for the promise from .all to fulfil
	public async iterateFolders(zip: JSZip) {
		let promises = [];
		try {
			for (let i in zip.files) { // i is a JSON object within the array of files returned by zip.files
				if (zip.files[i].name.substring(0, 7) === "courses") { 	// Check that the courses are in a courses folder
					if (!zip.files[i].dir) {							  	// If it's not the directory,
						promises.push(zip.files[i].async("blob")
							.then((blobStr) => {
								return blobStr.text();
							})
							.then((stringedBlob) => this.parseJSON(stringedBlob))
							.catch(() => {
								throw new InsightError();
							}));
					}
				}
			}
			return await Promise.all(promises) // Wait for all the promises in the promise list to fulfill
				.catch(() => {
					throw new InsightError("error occurred while waited for queued promises to fulfil");
				});
		} catch (e) {
			throw new InsightError();
		}

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
			if (insightDataset.id === id) { // !!! this will not work YET b/c we have not implemented the map in addDataset. However, this should be the intended behaviour
				this.datasets.delete(insightDataset);										// Delete the <K,V> pair from the map with this key, clears from memory
				this.datasetIDs.splice(this.datasetIDs.indexOf(id), 1); 			// Delete the ID from the ID list, clears from memory
				fs.removeSync("./data/" + id.toString());								// Synchronously remove the dataset with the id in the ./data folder, clears from disk
				return Promise.resolve(id.toString()); 										// after success
			}
		}
		return Promise.reject(new InsightError("Some other error occurred")); 				// If not invalid, does exist but isn't in loop, throw this error
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return new Promise<InsightResult[]>((resolve, reject) => {
			const newParser: QueryParser = new QueryParser(query, this);
			newParser.getQuery().then(function (returnedQuery: InsightQuery) {
				return returnedQuery.doQuery().then((result) => {
					return resolve(result);
				}).catch((err) => {
					return reject(err);
				});
			}).catch((err: InsightError | NotFoundError) => {
				return reject(err);
			});
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {		// Settling this promise: This promise only fufills, either an empty array or array of current datasets
		let result: InsightDataset[] = []; 					// Create a new temporary array, cannot return the keyset as it is an iterator
		for (const key of this.datasets.keys()) { 			// Iterate over the keyset, adding each key to the array
			result.push(key);
		}
		return Promise.resolve(result);          			// Return the list
	}
}

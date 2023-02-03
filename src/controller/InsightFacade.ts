import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";

import fs from "fs-extra";
import JSZip, {JSZipObject} from "jszip";
import Section from "./Section";


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


	// interp. a flag that tells the iterate function whether the JSON file has been read


	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.datasetIDs = [];													// Initialize an empty array of strings that will contain the currently added Dataset IDs
		this.datasets = new Map();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (this.invalidID(id)) {												// Check that the id is valid
			return Promise.reject(new InsightError("Invalid ID!"));
		}

		if (this.duplicateID(id)) {												// Check that there isn't a dataset already added with the same ID
			return Promise.reject(new InsightError("Duplicate ID!"));
		}
		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Rooms is not valid for this checkpoint!"));
		}


		return new Promise((resolve, reject) => {
			try {

				fs.mkdir("./data").catch(() => { 							// Create the ./data directory that clearDisk() clears on each run, push dataset representations into this file
					return Promise.reject(new InsightError("Creating ./data failed!"));
				});

				const JSzip = new JSZip();
				JSzip.loadAsync(content, {base64: true, checkCRC32: true}) // is loaded even if its invalid
					.then(async (zip) => {
							// TODO: make sure loadAsync will go to catch, currently it loads the file anyway even if its invalid
						console.log("1");
						await this.iterateFolders(zip, id, kind);
						console.log("6.5");

							// TODO: Push the representation of the dataset as a JSON file into the data folder, with ID as the title

						console.log("6.7");
						this.datasetIDs.push(id); 								// on successful add, add the datasetID
						return resolve(this.datasetIDs); 						// resolve with an array of strings which are the added IDs
					}
					)
					.catch((error) => {
						console.log("catching error thrown from iterate and rejecting");
						return reject(new InsightError(error));
					});

			} catch (e) {
				return reject(new InsightError());
			}
		});

		// return Promise.reject("Not implemented.");


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
	public parseJSON(t: string, idKey: string, kind: InsightDatasetKind) {
		let sectionArr: Section[] = []; 				// Push all the sections into an array, then push the array into the hashmap
		let validSectionCount: number = 0;				// Count the number of valid sections, only need at least one valid section to be a valid dataset, otherwise fail
		console.log("3");
		const result = JSON.parse(t).result; 		 	// Result is the array of the JSON objects

		for (const jsonObject of result) {			 	// Each JSON object is one whole section in result, check if key is undefined
			if (this.fieldIsUndefined(jsonObject)) {  	// Check all the fields of the current JSON object, if any required field is missing skip this object
				continue;
			}
			let toAdd: Section = new Section(jsonObject.id, jsonObject.Course,
				jsonObject.Title, jsonObject.Professor, jsonObject.Subject,
				jsonObject.Year, jsonObject.Avg, jsonObject.Pass, jsonObject.Fail, jsonObject.Audit);   // Create a new section

			sectionArr.push(toAdd); 					// Create a section object in one iteration, push it to the array

			validSectionCount++; 						// Increment the count of valid sections, "numRows is the number of valid sections in a dataset" @480

		}

		for (const section of sectionArr){
			console.log(section);
		}

		const newDataSet: InsightDataset = {
			id: idKey,
			kind: kind,
			numRows: validSectionCount
		};
		console.log("valid section count is " + validSectionCount);
		if (validSectionCount === 0) {
			throw new InsightError("No valid sections!");
		}

		this.datasets.set(newDataSet, sectionArr); 		// Add the insightdataset and section array to the in memory representation of the data

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

	// TODO: iterate over the files in sequence
	public async iterateFolders(zip: JSZip, idKey: string, kind: InsightDatasetKind) {
		let promises = [];
		try {
			for (let i in zip.files) { // i is a JSON object within the array of files returned by zip.files
				console.log("1.9");
				if (zip.files[i].dir && zip.files[i].name.substring(0, 7) !== "courses") { // This means with any folder that isnt courses it will throw.
					console.log("throwing no courses folder");
					// throw new InsightError("No courses folder!");
					continue;
				}
				if (zip.files[i].name.substring(0, 7) === "courses") { 	// Check that the courses are in a courses folder
					if (!zip.files[i].dir) {							  	// If it's not the directory,
						console.log("2");

						promises.push(zip.files[i].async("blob")
							.then((blobStr) => {
								return blobStr.text();
							})
							.then((stringedBlob) => this.parseJSON(stringedBlob, idKey, kind))
							.catch(() => {
								throw new InsightError();
							}));
					}
				}
			}
			console.log("6");
			return await Promise.all(promises) // Wait for all the promises in the promise list to fulfill
				.catch(() => {
					throw new InsightError("error occurred while waited for queued promises to fulfil");
				});
		} catch (e) {
			console.log("throwing the caught error from iterate");
			throw new InsightError();
		}

	}

	// public async readFile(file: JSZipObject, idKey: string, kind: InsightDatasetKind) {
	// 	try {
	// 		console.log("2.5");
	// 		let result = await file.async("blob");
	// 		console.log("read blob");
	// 		let text = await result.text();
	// 		console.log("read into text");
	// 		return this.parseJSON(text, idKey, kind);
	// 		console.log("parsed JSON");
	//
	// 	} catch (e) {
	// 		throw new InsightError();
	// 	}
	// 	console.log("4");
	//
	// }

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

				console.log("Removed: " + id.toString());
				fs.removeSync("./data/" + id.toString());								// Synchronously remove the dataset with the id in the ./data folder, clears from disk

				return Promise.resolve(id.toString()); 										// after success
			}
		}

		return Promise.reject(new InsightError("Some other error occurred")); 				// If not invalid, does exist but isn't in loop, throw this error
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {		// Settling this promise: This promise only fufills, either an empty array or array of current datasets
		let result: InsightDataset[] = []; 					// Create a new temporary array, cannot return the keyset as it is an iterator
		for (const key of this.datasets.keys()) { 			// Iterate over the keyset, adding each key to the array
			result.push(key);
		}
		return Promise.resolve(result);          			// Return the list
	}
}

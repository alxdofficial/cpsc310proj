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

		return new Promise((resolve, reject) => {
			try {
				fs.mkdir("./data").catch(() => { 							// Create the ./data directory that clearDisk() clears on each run, push dataset representations into this file
					return Promise.reject(new InsightError("Creating ./data failed!"));
				});
				let sectionArr: Section[] = [];

				const JSzip = new JSZip();
				JSzip.loadAsync(content, {base64: true}) // is loaded even if its invalid
					.then((zip) => {
							// TODO: read the zip file, iterate over the objects and instantiate section objects for each section in content
							// TODO: make sure loadAsync will go to catch, currently it loads the file anyway even if its invalid
							// loadAsync returns the updated Zip object. Promise fails if loaded data is not valid zip\

						zip.forEach((relativePath, file) => {  // Iterate over the files in the currently unzipped folder.
							if (relativePath.substring(0, 7) === "courses") { 	// Check that the courses are in a courses folder
								if (!file.dir) {							  	// If it's not the directory,
									file.async("blob")
										.then((blob) => (blob.text().then((t) => console.log(t))));
								}

							}
						});
							// const newDataSet: InsightDataset = {
							//
							// 	id: id,
							//
							// 	kind: kind,
							//
							// 	// numRows: TODO: find the rank of the .json file
							// };

						this.datasetIDs.push(id); 								// on successful add, add the datasetID
							// TODO: Push the InsightDataset tuple and it's section arrays into datasets Map<K,V>

							// TODO: Push the representation of the dataset as a JSON file into the data folder, with ID as the title

						return resolve(this.datasetIDs); 						// resolve with an array of strings which are the added IDs
					}
					)
					.catch((error) => {
						return reject(new InsightError(error));
					});

			} catch (e) {
				return reject(new InsightError());
			}
		});

		// return Promise.reject("Not implemented.");


	}

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

	public duplicateID(id: string): boolean {
		for (const item of this.datasetIDs) {												// Iterate over the list of dataset ids, if contains current then return true, other wise return false
			if (item === id) {
				return true;
			}
		}
		return false;
	}

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

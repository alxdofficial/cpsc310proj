import fs from "fs-extra";
import JSZip from "jszip";
import Section from "./Section";
import {DataProcessor} from "./DataProcessor";
import {InsightDataset, InsightDatasetKind, InsightError} from "../IInsightFacade";
import {Dataset} from "./Dataset";

export class AddSection implements DataProcessor {

	public addOnKind(dataset: Dataset): Promise<string[]> {
		return new Promise((resolve, reject) => {
			try {
				fs.mkdir("./data").catch(() => { 									// Create the ./data directory that clearDisk() clears on each run, push dataset representations into this file
					return Promise.reject(new InsightError("Creating ./data failed!"));
				});
				const JSzip = new JSZip();
				JSzip.loadAsync(dataset.getContent(), {
					base64: true,
					checkCRC32: true
				})        // is loaded even if its invalid
					.then(async (zip) => {
						await this.iterateFolders(zip, dataset);									// Iterate over the files, modifiy the class variables
						if (dataset.getRowCount() === 0) {
							throw new InsightError("No valid sections!");
						}
						const newDataSet: InsightDataset = {							// Create the dataset tuple
							id: dataset.getID(),
							kind: dataset.getKind(),
							numRows: dataset.getRowCount()
						};
						dataset.getDatasets().set(newDataSet, dataset.getSectionArr()); 				// Add the insightdataset and section array to the in memory representation of the data
						dataset.getDatasetIDs().push(dataset.getID()); 										// on successful add, add the datasetID

						await dataset.writeDataSections();
						dataset.setRowCount(0);												// CLEANUP: reset row count for future add calls
						dataset.setSectionArr([]);											// CLEANUP: empty the array for sections for future calls
						return resolve(dataset.getDatasetIDs()); 								// resolve with an array of strings which are the added IDs
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
	public async iterateFolders(zip: JSZip, dataset: Dataset) {
		let promises = [];
		try {
			for (let i in zip.files) { // i is a JSON object within the array of files returned by zip.files
				if (zip.files[i].name.substring(0, 7) === "courses") { 	// Check that the courses are in a courses folder
					if (!zip.files[i].dir) {							  	// If it's not the directory,
						promises.push(zip.files[i].async("blob")
							.then((blobStr) => {
								return blobStr.text();
							})
							.then((stringedBlob) => this.parse(stringedBlob, dataset))
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


	public parse(t: string, dataset: Dataset) {
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
			// Increment the count of valid sections, "numRows is the number of valid sections in a dataset" @480
			dataset.setRowCount(dataset.getRowCount() + 1);
		}
		dataset.getSectionArr().push(...localSectionArr);
	}

}

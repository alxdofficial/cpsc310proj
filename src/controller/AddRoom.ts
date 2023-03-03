import fs from "fs-extra";
import JSZip from "jszip";
import {parse} from "parse5";
import * as http from "http";
import Section from "./Section";
import {QueryParser} from "./ParseQuery";
import {DataProcessor} from "./DataProcessor";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import {Dataset} from "./Dataset";


export class AddRoom implements DataProcessor {
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
						console.log("back from iterate");
						if (dataset.getRowCount() === 0) {
							throw new InsightError("No valid rooms!");
						}
						const newDataSet: InsightDataset = {							// Create the dataset tuple
							id: dataset.getID(),
							kind: dataset.getKind(),
							numRows: dataset.getRowCount()
						};
						dataset.getDatasets().set(newDataSet, dataset.getRoomArr()); 				// Add the insightdataset and section array to the in memory representation of the data
						dataset.getDatasetIDs().push(dataset.getID()); 										// on successful add, add the datasetID

						await dataset.writeDataRooms();
						dataset.setRowCount(0);												// CLEANUP: reset row count for future add calls
						dataset.setRoomArr([]);											// CLEANUP: empty the array for sections for future calls
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


	public fieldIsUndefined(jsonObject: any): boolean {
		if (jsonObject.fullname === undefined) {
			return true;
		} else if (jsonObject.shortname === undefined) {
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

	// REQUIRES: a JSZip object, Dataset object
	// MODIFIES: N/A
	// EFFECTS: Queues all the file reads and pushes into a promise array,
	//			executes promise.all and awaits for the promise from .all to fulfil
	public async iterateFolders(zip: JSZip, dataset: Dataset) {
		let promises = [];
		try {
			for (let i in zip.files) { // i is a JSON object within the array of files returned by zip.files
				if (zip.files[i].name.substring(0, 9) === "index.htm") {
					promises.push(zip.files[i].async("blob")
						.then((blobStr) => {
							return blobStr.text();
						})
						.then((stringedBlob) => this.traverseDoc(parse(stringedBlob), dataset))
						.catch(() => {
							throw new InsightError();
						}));
				}
			}
			console.log("returning");
			return await Promise.all(promises) // Wait for all the promises in the promise list to fulfill
				.catch(() => {
					throw new InsightError("error occurred while waited for queued promises to fulfil");
				});
		} catch (e) {
			throw new InsightError();
		}
	}

	public traverseDoc(curr: any, dataset: Dataset) {
		// console.log("calling geo");
		// this.geoLocation("6245 Agronomy Road V6T 1Z4");

		// Traverse until html tagname, then access childnodes, then traverse until body tagname,then childNoes of body, then until tagname is div
		// , childnodes of div, tagname is section, childnodes of section, tagname is div, childnodes of div, tagname is table, childnodes of table, tagname is tbody
		 // search tr tagname childnodes for each cell, a row correlate to a shortname, filepath and address

		// Check if td-class, attrs, first element in array value is "views-field views-field-title"
		// <td class="views-field views-field-field-building-code"> for building shortName
		// go to childNodes of td-class, a, attrs, first element in array value as path
		// a row has all the info for a single building, then with the path execute the room search where I will build the individual rooms

		for (let i = 0;i < curr.childNodes.length; i++) {
			if (curr.childNodes[i].nodeName === "html") {
				console.log(curr.childNodes[i].childNodes[i]);
			}
		}

		// is the NodeName == "table"? if it is, is there at least one <td> element with a valid class? if it is then we've found our table
		// if the NodeName isn't table, keep searching each childnode in the list of childnodes


		// TODO traverse tree until we find the first valid table
		// TODO push all the file pathes and addresses into a Map, pass that Map into a method that looks for each building with the file path
		// TODO and for each building, execute findAddress on the Value, which will call geoLocation
		// "To find the valid table within an HTML file, you will need to look at the classes found on the <td> elements.
		// As soon as you find one <td> element with a valid class, the entire table is valid."


		// console.log(document);
		console.log("returning from traverse");
	}

	public geoLocation(address: string) {
		// TODO Send GET request using the http package to http://cs310.students.cs.ubc.ca:11316/api/v1/project_team<TEAM NUMBER>/<ADDRESS>
		// TODO receive the interface GeoResponse from the request
		// TODO return the Interface to the main method that constructs the Room object
		console.log("in geo");
		const encoded = encodeURIComponent(address);
		const queryString = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team198/" + encoded;
		console.log(queryString);
		http.get(queryString, (res) => {
			console.log(res.statusCode);

			console.log("in the promise");
			let location = "";
			console.log("in get");
			res.on("data", (data) => {
				console.log("getting data");
				location += data;
			});

			res.on("end", () => {
				console.log("in end");
				console.log(JSON.parse(location).title);
			});
		})
			.on("error", (e) => {
				console.log(e);
			});

		console.log("finsih geo");

	}

	public parse(t: string, dataset: Dataset) {
		let localRoomArr: Section[] = [];
		const result = JSON.parse(t).result; 		 	// Result is the array of the JSON objects

		for (const jsonObject of result) {			 	// Each JSON object is one whole section in result, check if key is undefined
			if (this.fieldIsUndefined(jsonObject)) {  	// Check all the fields of the current JSON object, if any required field is missing skip this object
				continue;
			}
			// TODO implement me below
			// let toAdd: Section = new Section(jsonObject.id, jsonObject.Course,
			// 	jsonObject.Title, jsonObject.Professor, jsonObject.Subject,
			// 	jsonObject.Year, jsonObject.Avg, jsonObject.Pass, jsonObject.Fail, jsonObject.Audit);   // Create a new section
			// localRoomArr.push(toAdd); 					// Create a section object in one iteration, push it to the array
			// // Increment the count of valid sections, "numRows is the number of valid sections in a dataset" @480
			// dataset.setRowCount(dataset.getRowCount() + 1);
		}
		dataset.getSectionArr().push(...localRoomArr);
	}


}

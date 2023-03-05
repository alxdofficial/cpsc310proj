import fs from "fs-extra";
import JSZip from "jszip";
import {parse} from "parse5";
import * as http from "http";
import Section from "./Section";
import {QueryParser} from "./ParseQuery";
import {DataProcessor} from "./DataProcessor";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import {Dataset} from "./Dataset";
import {TraversalTools} from "./TraversalTools";


export class AddRoom implements DataProcessor {
	public traversalTool: TraversalTools;

	constructor() {
		this.traversalTool = new TraversalTools();
	}

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
						.then((stringedBlob) => this.findHTMLNode(parse(stringedBlob), dataset))
						.catch(() => {
							throw new InsightError();
						}));
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

	public findHTMLNode(doc: any, dataset: Dataset) {
		for (let i = 0; i < doc.childNodes.length; i++) {
			this.findHTMLNodeName(doc.childNodes[i], i, dataset);
		}
	}

	public findHTMLNodeName(childNode: any, i: number, dataset: Dataset) {
		if (childNode.nodeName === "html") {
			console.log("invoked traverse " + childNode);
			try {
				this.traverseNode(childNode, dataset);
			} catch (e) {
				console.log("caught an error" + e);
			}
		}
	}

	// REQUIRES: the HTML Document object with its traits and a dataset to pass for modification
	// MODIFIES: N/A
	// EFFECTS: traverses the document until it finds a table, then calls helpers to search the rows
	public traverseNode(curr: any, dataset: Dataset) {
		if (!curr.childNodes) {
			return;
		}
		if (curr.tagName === "table" && this.validTable(curr.childNodes)) {
			this.traversalTool.searchRows(curr.childNodes, dataset)
				.catch(() => {
					throw new InsightError();
				});
			return; // return here, only one valid table so once we find don't need to keep going
		}
		for (let trait of curr.childNodes) {
			if (!trait.childNodes) {
				continue;
			}
			this.traverseNodes(trait.childNodes, dataset);
		}
	}

	// REQUIRES: the list of childnodes passed by traverseNode, the dataset object
	// MODIFIES: N/A
	// EFFECTS: traverses the list of nodes mutually recursively
	public traverseNodes(childNodeList: any, dataset: Dataset) {
		for (let node of childNodeList) {
			if (!node.childNodes || this.fitsExclusion(node.nodeName)) { // if the node doesn't have children, continue, otherwise search the children
				continue;
			}
			this.traverseNode(node, dataset);
		}
	}


	// REQUIRES: the nodeName
	// MODIFIES: N/A
	// EFFECTS: return true if the nodeName is not something we want to search
	public fitsExclusion(name: string): boolean {
		if (name === "meta") {
			return true;
		} else if (name === "link") {
			return true;
		} else if (name === "title") {
			return true;
		} else if (name === "script") {
			return true;
		} else if (name === "noscript") {
			return true;
		} else if (name === "footer") {
			return true;
		} else if (name === "header") {
			return true;
		}
		return false;
	}

	// REQUIRES: list of childnodes of table passed by caller
	// MODIFIES: N/A
	// EFFECTS: returns true if there is at least one valid table, otherwise false

	public validTable(tableChildNodes: any): boolean {
		let tableBodyChildNodes;
		for (let node of tableChildNodes) {
			if (node.nodeName === "tbody") {
				tableBodyChildNodes = node.childNodes;
			}
		}
		for (let node of tableBodyChildNodes) {
			if (node.nodeName === "tr") {
				for (let innerNode of node.childNodes) {
					if (innerNode.nodeName === "td") {
						if (this.checkValidClass(innerNode.attrs[0].value)) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	public checkValidClass(attributeVals: string): boolean {
		return attributeVals === "views-field views-field-field-building-image"
			|| attributeVals === "views-field views-field-field-building-code"
			|| attributeVals === "views-field views-field-title"
			|| attributeVals === "views-field views-field-field-building-address"
			|| attributeVals === "views-field views-field-nothing";
	}


	public parse(t: string, dataset: Dataset) {
		let localRoomArr: Section[] = [];
		const result = JSON.parse(t).result; 		 	// Result is the array of the JSON objects

		for (const jsonObject of result) {			 	// Each JSON object is one whole section in result, check if key is undefined
			// if (this.fieldIsUndefined(jsonObject)) {  	// Check all the fields of the current JSON object, if any required field is missing skip this object
			// 	continue;
			// }
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

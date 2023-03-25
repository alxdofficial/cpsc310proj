import fs from "fs-extra";
import JSZip from "jszip";
import {parse} from "parse5";
import {DataProcessor} from "./DataProcessor";
import {InsightDataset, InsightError} from "../IInsightFacade";
import {Dataset} from "./Dataset";
import {ParseIndexFile} from "./ParseIndexFile";
import {TableValidity} from "./TableValidity";


export class AddRoom extends TableValidity implements DataProcessor {

	private foundFlag: boolean = false;
	private traversePromises: any[] = [];

	public addOnKind(dataset: Dataset): Promise<string[]> {
		return new Promise((resolve, reject) => {
			try {
				if (!fs.existsSync("./data")) {
					fs.mkdir("./data").catch((err) => { 									// Create the ./data directory that clearDisk() clears on each run, push dataset representations into this file
						return Promise.reject(err);
					});
				}
				const JSzip = new JSZip();
				JSzip.loadAsync(dataset.getContent(), {
					base64: true,
					checkCRC32: true
				})        // is loaded even if its invalid
					.then(async (zip) => {
						await this.iterateFolders(zip, dataset);									// Iterate over the files, modifiy the class variables
						if (dataset.getRowCount() === 0) {
							throw new InsightError("No valid rooms!");
						}
						const newDataSet: InsightDataset = {							// Create the dataset tuple
							id: dataset.getID(),
							kind: dataset.getKind(),
							numRows: dataset.getRowCount()
						};
						dataset.getDatasets().set(newDataSet, dataset.getRoomArr()); 				        // Add the insightdataset and section array to the in memory representation of the data
						dataset.getDatasetIDs().push(dataset.getID()); 										// on successful add, add the datasetID
						await dataset.writeDataRooms();
						dataset.setRowCount(0);												// CLEANUP: reset row count for future add calls
						dataset.setRoomArr([]);												// CLEANUP: empty the array for sections for future calls
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


	public async findHTMLNode(doc: any, dataset: Dataset) {
		let promises = [];
		for (let i = 0; i < doc.childNodes.length; i++) {
			promises.push(this.findHTMLNodeName(doc.childNodes[i], i, dataset));
		}
		await Promise.all(promises)
			.catch(() => {
				throw new InsightError();
			});
	}

	public async findHTMLNodeName(childNode: any, i: number, dataset: Dataset) {
		if (childNode.nodeName === "html") {
			try {
				this.traversePromises.push(this.traverseNode(childNode, dataset));
				await Promise.all(this.traversePromises)
					.catch(() => {
						throw new InsightError();
					});
			} catch (e) {
				throw new InsightError("error occured while finding HTMLNodeName");
			}
		}
	}

	// REQUIRES: the HTML Document object with its traits and a dataset to pass for modification
	// MODIFIES: N/A
	// EFFECTS: traverses the document until it finds a table, then calls helpers to search the rows
	public async traverseNode(curr: any, dataset: Dataset) {
		if (!curr.childNodes) {
			return;
		}

		if (curr.tagName === "table" && this.validTableIndex(curr.childNodes)) {
			if (!this.checkHeaders(curr.childNodes)) {
				return new InsightError("missing column in index");
			}
			const traverser: ParseIndexFile = new ParseIndexFile();
			this.foundFlag = true; // signal to traverseLoN that we can stop because this table is valid
			return await traverser.searchRows(curr.childNodes, dataset)
				.catch(() => {
					throw new InsightError();
				});
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
			if (this.foundFlag) {
				return;
			}
			this.traversePromises.push(this.traverseNode(node, dataset));
		}
	}


	// REQUIRES: the list of childnodes passed by traverseNode, the childnodes of the table
	// MODIFIES: N/A
	// EFFECTS: traverse the header to see that all five columns exist
	public checkHeaders(tableChildren: any): boolean {
		for (let node of tableChildren) {
			if (node.tagName === "thead") {
				for (let header of node.childNodes) {
					if (header.tagName === "tr") {
						return this.verifyHeaders(header.childNodes);
					}
				}
			}
		}
		return false; // no rows were found in the header
	}

	public verifyHeaders(curr: any): boolean {
		let toCheck: string[] = [];
		const validator: TableValidity = new TableValidity();
		for (let node of curr) {
			if (node.tagName === "th") {
				for (let trait of node.attrs) {
					if (validator.checkValidClassIndexFile(trait.value)) {
						toCheck.push(trait.value);
					}
				}
			}
		}
		return this.verifyText(toCheck);
	}

	public verifyText(arr: string[]): boolean {
		let b0: boolean = false;
		let b1: boolean = false;
		let b2: boolean = false;
		let b3: boolean = false;
		let b4: boolean = false;
		for (let headerText of arr) {
			if (headerText === "views-field views-field-field-building-image"
				|| headerText === "views-field-field-building-image views-field") {
				b0 = true;
				continue;
			}
			if (headerText === "views-field views-field-field-building-code"
				|| headerText === "views-field-field-building-code views-field") {
				b1 = true;
				continue;
			}
			if (headerText === "views-field views-field-title"
				|| headerText === "views-field-title views-field") {
				b2 = true;
				continue;
			}
			if (headerText === "views-field views-field-field-building-address"
				|| headerText === "views-field-field-building-address views-field") {
				b3 = true;
				continue;
			}
			if (headerText === "views-field views-field-nothing"
				|| headerText === "views-field-nothing views-field") {
				b4 = true;
			}

		}
		return b0 && b1 && b2 && b3 && b4;
	}


}

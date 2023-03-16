import {Dataset} from "./Dataset";
import {AddRoom} from "./AddRoom";
import http from "http";
import {InsightDataset, InsightError} from "../IInsightFacade";
import fs from "fs-extra";
import {parse} from "parse5";
import JSZip from "jszip";
import {TraverseBuildingFile} from "./TraverseBuildingFile";
import {PartialRoom} from "./DataProcessor";

export class ParseIndexFile {
	public zipped: JSZip = new JSZip();

	public async unZip(dataset: Dataset) {
		try {
			const JSzip = new JSZip();
			this.zipped = await JSzip.loadAsync(dataset.getContent(), {
				base64: true,
				checkCRC32: true
			});


		} catch (e) {
			console.log("caught an error: " + e);
		}
		// TODO execute the read, then pass the results to a parse method, recursive search for table like before

	}

	// REQUIRES: a JSZip object, Dataset object
	// MODIFIES: N/A
	// EFFECTS: Queues all the file reads and pushes into a promise array,
	//			executes promise.all and awaits for the promise from .all to fulfil
	public async iterateCampus(zip: JSZip, fromIndex: PartialRoom, dataset: Dataset) {
		let promises = [];
		try {
			for (let i in zip.files) { // i is a JSON object within the array of files returned by zip.files
				if (zip.files[i].name === fromIndex.path.substring(2)) { // if the file name and the path name is the same, unzip that folder
					promises.push(zip.files[i].async("blob")
						.then((blobStr) => {
							return blobStr.text();
						})
						.then((stringedBlob) =>
							this.executeBuildingRead(parse(stringedBlob), dataset, fromIndex))
						.catch(() => {
							throw new InsightError();
						}));
				}
			}
			await Promise.all(promises) // Wait for all the promises in the promise list to fulfill
				.catch(() => {
					throw new InsightError("error occurred while waited for queued promises to fulfil");
				});
		} catch (e) {
			throw new InsightError();
		}
	}

	public async executeBuildingRead(doc: any, dataset: Dataset, fromIndex: PartialRoom) {
		const buildingFileTraverser: TraverseBuildingFile = new TraverseBuildingFile();
		await buildingFileTraverser.findHTMLNode(doc, dataset, fromIndex);
	}

	public async searchRows(tableChildNodes: any, dataset: Dataset) {
		await this.unZip(dataset);
		let promises: any[] = [];
		let tableBodyChildNodes;
		for (let node of tableChildNodes) {
			if (node.nodeName === "tbody") {
				tableBodyChildNodes = node.childNodes;
			}
		}
		for (let node of tableBodyChildNodes) {
			if (node.nodeName === "tr") {
				const curr: PartialRoom = // if any of the interface fields are still "temp" except for fullname after, then that means we couldn't find the table cell that means the table cell doesn't exist, and that room isnt valid
					{
						fullName: "temp",
						shortName: "temp",
						address: "temp",
						path: "temp"
					};
				for (let innerNode of node.childNodes) {
					if (innerNode.nodeName === "td") {
						if (this.isShortName(innerNode)) {
							curr.shortName = this.findShortName(innerNode);
						}
						// if (this.isFilePath(innerNode)) {
						// 	curr.path = this.findFilePath(innerNode);
						// }
						if (this.isAddress(innerNode)) {
							curr.address = this.findAddress(innerNode);
						}
						if (this.isFullName(innerNode)) {
							curr.fullName = this.findFullName(innerNode);
							curr.path = this.findFilePath(innerNode);
						}
					}
				}
				if (this.checkPartial(curr)) {
					continue;
				}
				promises.push(this.iterateCampus(this.zipped, curr, dataset));
			}
		}
		return await Promise.all(promises)
			.catch(() => {
				throw new InsightError();
			});
	}

	// REQUIRES: a PartialRoom
	// MODIFIES: N/A
	// EFFECTS: checks the current partial room if any entries are still a stub after checking the row
	//			if it is, return true.
	public checkPartial(partial: PartialRoom): boolean {
		return (partial.shortName === "temp" || partial.address === "temp"
			|| partial.path === "temp" || partial.fullName === "temp");
	}

	public isShortName(cellObject: any): boolean {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-field-building-code") {
				return true;
			}
		}
		return false;
	}

	public findShortName(cellObject: any): string {
		for (let node of cellObject.childNodes) {
			if (node.nodeName === "#text") {
				return node.value.replace(/\s/g, ""); // remove the spaces with: https://stackoverflow.com/questions/5963182/how-to-remove-spaces-from-a-string-using-javascript
			}
		}
		return "";
	}

	public isFilePath(cellObject: any): boolean {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-title") {
				return true;
			}
		}
		return false;
	}

	public findFilePath(cellObject: any): string {
		for (let node of cellObject.childNodes) {
			if (node.nodeName === "a") {
				for (let attr of node.attrs) {
					if (attr.name === "href") {
						return attr.value;
					}
				}
			}
		}
		return "";
	}

	public isAddress(cellObject: any): boolean {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-field-building-address") {
				return true;
			}
		}
		return false;
	}

	public findAddress(cellObject: any): string {
		for (let node of cellObject.childNodes) {
			if (node.nodeName === "#text") {
				return node.value.replace(/(\r\n|\n|\r)/gm, " ").trim(); // remove line breaks in address: https://www.textfixer.com/tutorials/javascript-line-breaks.php
			}
		}
		return "";
	}

	public isFullName(cellObject: any): boolean {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-title") {
				return true;
			}
		}
		return false;
	}

	public findFullName(cellObject: any): string {
		for (let node of cellObject.childNodes) {
			if (node.nodeName === "a") {
				for (let curr of node.childNodes) {
					if (curr.nodeName === "#text") {
						return curr.value;
					}
				}
			}
		}
		return "";
	}
}

import {Dataset} from "./Dataset";
import {AddRoom} from "./AddRoom";
import http from "http";
import {InsightDataset, InsightError} from "./IInsightFacade";
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
		let roomAdder: AddRoom = new AddRoom();
		try {
			for (let i in zip.files) { // i is a JSON object within the array of files returned by zip.files
				if (zip.files[i].name === fromIndex.path.substring(2)) { // if the file name and the path name is the same, unzip that folder
					promises.push(zip.files[i].async("blob")
						.then((blobStr) => {
							return blobStr.text();
						})
						.then((stringedBlob) => this.executeBuildingRead(parse(stringedBlob), dataset, fromIndex))
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

	public executeBuildingRead(doc: any, dataset: Dataset, fromIndex: PartialRoom) {
		const buildingFileTraverser: TraverseBuildingFile = new TraverseBuildingFile();
		buildingFileTraverser.findHTMLNode(doc, dataset, fromIndex);
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
						lat: 0,
						lon: 0,
						address: "temp",
						path: "temp"
					};
				for (let innerNode of node.childNodes) {
					if (innerNode.nodeName === "td") {
						if (this.isShortName(innerNode)) {
							curr.shortName = this.findShortName(innerNode);
							// console.log(curr.shortName);
						}
						if (this.isFilePath(innerNode)) {
							curr.path = this.findFilePath(innerNode);
							 // console.log(curr.path);
						}
						if (this.isAddress(innerNode)) {
							curr.address = this.findAddress(innerNode);
							// console.log(curr.address);
						}
						if (this.isFullName(innerNode)) {
							curr.fullName = this.findFullName(innerNode);
							 // console.log(curr.fullName);
						}
					}
				}
				 promises.push(this.iterateCampus(this.zipped, curr, dataset));
				// promises.push(this.geoLocation(curr, promises, dataset));
				console.log("going to next row");
			}
		}
		console.log("waiting for the promises");
		return await Promise.all(promises)
			.catch(() => {
				throw new InsightError();
			});
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
		return "unreachable";
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

	public geoLocation(currentInfo: PartialRoom, promises: Array<Promise<void[]>>,
					   dataset: Dataset) {
		console.log("in geo");
		const encoded = encodeURIComponent(currentInfo.address);
		const queryString = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team198/" + encoded;
		console.log(queryString);
		http.get(queryString, (res) => {
			// TODO figure out why this callback isn't being called. it was working before we were having queries with the proper URL
			console.log(res.statusCode);

			let location = "";
			res.on("data", (data) => {
				console.log("getting data");
				location += data;
			});

			res.on("end", () => {
				console.log("in end");
				let jsond = JSON.parse(location);
				console.log("got location for " + currentInfo.address);
				console.log("lat is" + jsond.lat);
				console.log("lon is" + jsond.lon);
				// promises.push(this.iterateCampus(this.zipped, currentInfo, dataset));
				return this.iterateCampus(this.zipped, currentInfo, dataset);
			});
		})
			.on("error", (e) => {
				console.log(e);
			});

		console.log("finsih geo");

	}
}

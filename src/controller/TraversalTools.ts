import {Dataset} from "./Dataset";
import {AddRoom} from "./AddRoom";
import http from "http";
import {InsightError} from "./IInsightFacade";

export class TraversalTools {


	public async buildRoom(fromIndex: string[]) {
		for (let i = 0; i < fromIndex.length; i++) {
			if (fromIndex[i].includes("htm")) {
				console.log(fromIndex[i] + " " + i);
				// TODO execute the read, then pass the results to a parse method, recursive search for table like before
			}
		}
	}


	public async searchRows(tableChildNodes: any, dataset: Dataset) {
		let promises = [];
		let shortname: string;
		let filepath: string;
		let address: string;
		let tableBodyChildNodes;
		for (let node of tableChildNodes) {
			if (node.nodeName === "tbody") {
				tableBodyChildNodes = node.childNodes;
			}
		}
		for (let node of tableBodyChildNodes) {
			if (node.nodeName === "tr") {
				let currentInfo = [];
				for (let innerNode of node.childNodes) {
					if (innerNode.nodeName === "td") {
						if (this.isBuildingCode(innerNode)) {
							shortname = this.findShortName(innerNode);
							currentInfo.push(shortname);
							// console.log(shortname);
						}
						if (this.findFilePath(innerNode)) {
							filepath = this.filePath(innerNode);
							currentInfo.push(filepath);
							// console.log(filepath);
						}
						if (this.isAddress(innerNode)) {
							address = this.findAddress(innerNode);
							currentInfo.push(address);
							// console.log(address);
						}
					}
				}
				promises.push(this.buildRoom(currentInfo));
			}
		}
		return await Promise.all(promises)
			.catch(() => {
				throw new InsightError();
			});
	}

	public isBuildingCode(cellObject: any): boolean {
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

	public findFilePath(cellObject: any): boolean {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-title") {
				return true;
			}
		}
		return false;
	}

	public filePath(cellObject: any): string {
		for (let node of cellObject.childNodes) {
			if (node.nodeName === "a") {
				for (let attr of node.attrs) {
					if (attr.name === "href") {
						return attr.value;
					}
				}
			}
		}
		return "unreachable";
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
				return node.value;
			}
		}
		return "unreachable";
	}


	public geoLocation(address: string): [lat: string, lon: string] {
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

		return ["stub", "stub"];

	}


}

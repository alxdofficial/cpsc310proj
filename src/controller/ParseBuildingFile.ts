import {Dataset} from "./Dataset";
import {AddRoom} from "./AddRoom";
import http from "http";
import {InsightDataset, InsightError} from "./IInsightFacade";
import fs from "fs-extra";
import {parse} from "parse5";
import JSZip from "jszip";
import {TraverseBuildingFile} from "./TraverseBuildingFile";
import {PartialRoom} from "./DataProcessor";

export class ParseBuildingFile {

	private geoPromises: any[] = [];

	public searchRows(tableChildNodes: any, dataset: Dataset, fromIndex: PartialRoom, lat: number, lon: number) {
		let roomNumber: string;
		let roomCapacity: string;
		let roomFurniture: string;
		let roomType: string;
		let href: string;
		let tableBodyChildNodes;
		for (let node of tableChildNodes) {
			if (node.nodeName === "tbody") {
				tableBodyChildNodes = node.childNodes;
			}
		}
		console.log("in search rows");
		for (let node of tableBodyChildNodes) {
			if (node.nodeName === "tr") {
				for (let innerNode of node.childNodes) {
					if (innerNode.nodeName === "td") {
						if (this.isRoomNumber(innerNode)) {
							console.log(fromIndex.shortName + " buidling shortname " + fromIndex.path + " building filepath "
								+ fromIndex.address + " building address" + fromIndex.fullName + " building full name");
							roomNumber = this.findRoomNumber(innerNode);
							console.log("room num is " + roomNumber);
						}
						if (this.isRoomCapacity(innerNode)) {
							roomCapacity = this.findRoomCapacity(innerNode);
							console.log("room cap is " + roomCapacity);
						}
						if (this.isRoomFurniture(innerNode)) {
							roomFurniture = this.findRoomFurniture(innerNode);
							console.log("funriture is:" + roomFurniture);
						}
						if (this.isRoomType(innerNode)) {
							roomType = this.findRoomType(innerNode);
							console.log("roome type is " + roomType);
						}
						if (this.isHref(innerNode)) {
							href = this.findHref(innerNode);
							console.log("href is " + href);
						}
					}
				}

				// TODO set a new room into the room array here
				console.log("lat is " + lat);
				console.log("lon is " + lon);
				// TODO: could invoke geolocation getter here, or actually the promise array might go here, not sure
			}
		}
	}

	// public scaffoldRooms()


	public async geoLocation(tableChildNodes: any, dataset: Dataset, fromIndex: PartialRoom) {
		console.log("in geo");
		const encoded = encodeURIComponent(fromIndex.address);
		const queryString = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team198/" + encoded;
		let lat: string;
		let lon: string;
		console.log(queryString);
		return new Promise((resolve, reject) => http.get(queryString, (res) => {
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
				console.log("got location for " + fromIndex.address);
				console.log("lat is" + jsond.lat);
				console.log("lon is" + jsond.lon);
				lat = jsond.lat;
				lon = jsond.lon;
				return resolve(this.searchRows(tableChildNodes, dataset, fromIndex, parseFloat(lat), parseFloat(lon)));
				// return Promise.resolve();
			});
		})
			.on("error", (e) => {
				console.log(e);
				return reject(new InsightError("error occured while getting coordinates"));
			}));
	}

	public isRoomNumber(cellObject: any): boolean {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-field-room-number") {
				return true;
			}
		}
		return false;
	}

	public findRoomNumber(cellObject: any): string {
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

	public isRoomCapacity(cellObject: any): boolean {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-field-room-capacity") {
				return true;
			}
		}
		return false;
	}

	public findRoomCapacity(cellObject: any): string {
		for (let node of cellObject.childNodes) {
			if (node.nodeName === "#text") {
				return node.value.replace(/\s/g, ""); // remove the spaces with: https://stackoverflow.com/questions/5963182/how-to-remove-spaces-from-a-string-using-javascript
			}
		}
		return "";
	}

	public isRoomFurniture(cellObject: any): boolean {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-field-room-furniture") {
				return true;
			}
		}
		return false;
	}

	public findRoomFurniture(cellObject: any): string {
		for (let node of cellObject.childNodes) {
			if (node.nodeName === "#text") {
				return node.value;
			}
		}
		return "";
	}

	public isRoomType(cellObject: any): boolean {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-field-room-type") {
				return true;
			}
		}
		return false;
	}

	public findRoomType(cellObject: any): string {
		for (let node of cellObject.childNodes) {
			if (node.nodeName === "#text") {
				return node.value;
			}
		}
		return "";
	}

	public isHref(cellObject: any): boolean {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-nothing") {
				return true;
			}
		}
		return false;
	}

	public findHref(cellObject: any): string {
		for (let node of cellObject.childNodes) {
			if (node.nodeName === "a") {
				return node.attrs[0].value;
			}
		}
		return "";
	}


}

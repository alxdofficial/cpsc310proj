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

	public searchRows(tableChildNodes: any, dataset: Dataset, fromIndex: PartialRoom) {
		let promises = [];
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
				// TODO: could invoke geolocation getter here, or actually the promise array might go here, not sure
			}
		}
	}

	// public scaffoldRooms()

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

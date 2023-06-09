import {Dataset} from "./Dataset";
import http from "http";
import {InsightDataset, InsightError} from "../IInsightFacade";
import {PartialBuilding, PartialRoom} from "./DataProcessor";
import Room from "../Room";

export class ParseBuildingFile {

	public searchRows(tableChildNodes: any, dataset: Dataset, fromIndex: PartialRoom, lat: number, lon: number) {
		let tableBodyChildNodes;
		for (let node of tableChildNodes) {
			if (node.nodeName === "tbody") {
				tableBodyChildNodes = node.childNodes;
			}
		}
		for (let node of tableBodyChildNodes) {
			if (node.nodeName === "tr") {
				const curr: PartialBuilding = // if any of the interface fields are still "temp" except for fullname after, then that means we couldn't find the table cell that means the table cell doesn't exist, and that room isnt valid
					{
						roomNumber: "temp",
						roomCapacity: -1,
						roomFurn: "temp",
						roomType: "temp",
						href: "temp"
					};
				for (let innerNode of node.childNodes) {
					if (innerNode.nodeName === "td") {
						if (this.isRoomNumber(innerNode)) {
							curr.roomNumber = this.findRoomNumber(innerNode);
						}
						if (this.isRoomCapacity(innerNode)) {
							curr.roomCapacity = parseInt(this.findRoomCapacity(innerNode), 10) || 0;
							// console.log(curr.roomCapacity);
						}
						if (this.isRoomFurniture(innerNode)) {
							curr.roomFurn = this.findRoomFurniture(innerNode).trim();
						}
						if (this.isRoomType(innerNode)) {
							curr.roomType = this.findRoomType(innerNode).trim();
						}
						if (this.isHref(innerNode)) {
							curr.href = this.findHref(innerNode);
						}
					}
				}
				if (this.checkPartial(curr)) { // if this is true, skip the current room
					continue;
				}
				this.scaffoldRooms(curr, fromIndex, lat, lon, dataset);
			}
		}
	}


	// REQUIRES: a PartialBuilding (room)
	// MODIFIES: N/A
	// EFFECTS: checks the current PartialBuilding room if any entries are still a stub after checking the row
	//			if it is, return true.
	public checkPartial(partial: PartialBuilding): boolean {
		return (partial.roomNumber === "temp" || partial.roomCapacity === -1 ||
			partial.roomFurn === "temp" || partial.roomType === "temp" || partial.href === "temp");
	}


	public scaffoldRooms(building: PartialBuilding, partial: PartialRoom, lat: number, lon: number, dataset: Dataset) {
		let toAdd = new Room(partial.fullName, partial.shortName, building.roomNumber,
			partial.shortName + "_" + building.roomNumber,
			partial.address, lat, lon, building.roomCapacity, building.roomType, building.roomFurn, building.href);
		dataset.addToRoomArr(toAdd);
		dataset.setRowCount(dataset.getRowCount() + 1);
	}


	public async geoLocation(tableChildNodes: any, dataset: Dataset, fromIndex: PartialRoom) {
		const encoded = encodeURIComponent(fromIndex.address);
		const queryString = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team198/" + encoded;
		let lat: string;
		let lon: string;
		return new Promise((resolve, reject) => http.get(queryString, (res) => {
			const contentType = res.headers["content-type"]; // from Node.js example https://nodejs.org/api/http.html#httpgeturl-options-callback
			if (res.statusCode !== 200 || !/^application\/json/.test(contentType as string)) {
				res.resume();
				return resolve("address getting failed");
			}
			let location = "";
			res.on("data", (data) => {
				location += data;
			});

			res.on("end", () => {
				let jsond = JSON.parse(location);
				lat = jsond.lat;
				lon = jsond.lon;
				return resolve(this.searchRows(tableChildNodes, dataset, fromIndex, parseFloat(lat), parseFloat(lon)));
			});
		})
			.on("error", (e) => {
				console.log("on error");
				return resolve("some error occured");
			}));
	}

	public isRoomNumber(cellObject: any): boolean {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-field-room-number"
				|| attribute.value === "views-field-field-room-number views-field") {
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
			if (attribute.value === "views-field views-field-field-room-capacity"
				|| attribute.value === "views-field-field-room-capacity views-field") {
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
		return "0";
	}

	public isRoomFurniture(cellObject: any): boolean {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-field-room-furniture"
				|| attribute.value === "views-field-field-room-furniture views-field") {
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
			if (attribute.value === "views-field views-field-field-room-type"
				|| attribute.value === "views-field-field-room-type views-field") {
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
			if (attribute.value === "views-field views-field-nothing"
				|| attribute.value === "views-field-nothing views-field") {
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

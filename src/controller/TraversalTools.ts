import {Dataset} from "./Dataset";
import {AddRoom} from "./AddRoom";

export class TraversalTools {

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


	public searchRows(tableChildNodes: any): Array<[shortname: string, filepath: string, address: string]> {
		const foundData: Array<[string, string, string]> = [];
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
				for (let innerNode of node.childNodes) {
					if (innerNode.nodeName === "td") {
						shortname = this.findShortName(innerNode);
						filepath = this.findFilePath(innerNode);
						address = this.findAddress(innerNode);
						foundData.push([shortname, filepath, address]);
					}
				}
			}
		}
		return foundData;
	}

	public findShortName(cellObject: any): string {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-field-building-code") {
				for (let node of cellObject.childNodes) {
					if (node.nodeName === "#text") {
						console.log(node.value.replace(/\s/g, ""));
						return node.value.replace(/\s/g, ""); // remove the spaces with: https://stackoverflow.com/questions/5963182/how-to-remove-spaces-from-a-string-using-javascript
					}
				}
			}
		}
		return "unreachable";
	}


	public findFilePath(cellObject: any): string {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-title") {
				return this.filePath(cellObject);
			}
		}
		return "unreachable";
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

	public findAddress(cellObject: any): string {
		for (let attribute of cellObject.attrs) {
			if (attribute.value === "views-field views-field-field-building-address") {
				for (let node of cellObject.childNodes) {
					if (node.nodeName === "#text") {
						console.log(node.value);
						return node.value; // remove the spaces with: https://stackoverflow.com/questions/5963182/how-to-remove-spaces-from-a-string-using-javascript
					}
				}
			}
		}
		return "unreachable";

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
}

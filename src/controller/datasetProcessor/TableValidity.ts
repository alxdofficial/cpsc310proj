export class TableValidity {

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

	public validTableIndex(tableChildNodes: any): boolean {
		let tableBodyChildNodes;
		for (let node of tableChildNodes) {
			if (node.nodeName === "tbody") {
				tableBodyChildNodes = node.childNodes;
				break;
			}
		}
		for (let node of tableBodyChildNodes) {
			if (node.nodeName === "tr") {
				for (let innerNode of node.childNodes) {
					if (innerNode.nodeName === "td") {
						if (this.checkValidClassIndexFile(innerNode.attrs[0].value)) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	public validTableBuilding(tableChildNodes: any): boolean {
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
						if (this.checkValidClassBuildingFile(innerNode.attrs[0].value)) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	public checkValidClassIndexFile(attributeVals: string): boolean {
		return attributeVals === "views-field views-field-field-building-image"
			|| attributeVals === "views-field views-field-field-building-code"
			|| attributeVals === "views-field views-field-title"
			|| attributeVals === "views-field views-field-field-building-address"
			|| attributeVals === "views-field views-field-nothing";
	}

	public checkValidClassBuildingFile(attributeVals: string): boolean {
		return attributeVals === "views-field views-field-field-room-number"
			|| attributeVals === "views-field views-field-field-room-capacity"
			|| attributeVals === "views-field views-field-field-room-furniture"
			|| attributeVals === "views-field views-field-field-room-type"
			|| attributeVals === "views-field views-field-nothing";
	}
}

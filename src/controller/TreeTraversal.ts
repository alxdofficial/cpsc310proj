import {Dataset} from "./Dataset";
import {InsightError} from "./IInsightFacade";

export abstract class TreeTraversal {

	public findHTMLNode(doc: any, dataset: Dataset) {
		for (let i = 0; i < doc.childNodes.length; i++) {
			this.findHTMLNodeName(doc.childNodes[i], i, dataset);
		}
	}

	public findHTMLNodeName(childNode: any, i: number, dataset: Dataset) {
		if (childNode.nodeName === "html") {
			console.log("invoked traverse " + childNode.nodeName);
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
			this.workOnFile(curr.childNodes, dataset)
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

	public abstract workOnFile(currentChildNodes: any, dataset: Dataset): any;
}

import {DataProcessor, PartialRoom} from "./DataProcessor";
import {InsightDataset, InsightDatasetKind, InsightError} from "../IInsightFacade";
import {Dataset} from "./Dataset";
import {ParseBuildingFile} from "./ParseBuildingFile";
import {TableValidity} from "./TableValidity";


export class TraverseBuildingFile extends TableValidity {

	private foundFlag: boolean = false;
	private traversePromises: any[] = [];

	public async findHTMLNode(doc: any, dataset: Dataset, fromIndex: PartialRoom) {
		let promises = [];
		for (let i = 0; i < doc.childNodes.length; i++) {
			promises.push(this.findHTMLNodeName(doc.childNodes[i], i, dataset, fromIndex));
		}
		await Promise.all(promises)
			.catch(() => {
				throw new InsightError();
			});
	}


	public async findHTMLNodeName(childNode: any, i: number, dataset: Dataset, fromIndex: PartialRoom) {
		if (childNode.nodeName === "html") {
			try {
				this.traversePromises.push(this.traverseNode(childNode, dataset, fromIndex));
				await Promise.all(this.traversePromises)
					.catch(() => {
						throw new InsightError();
					});
			} catch (e) {
				throw new InsightError("error occured while finding HTML node");
			}
		}
	}

	// REQUIRES: the HTML Document object with its traits and a dataset to pass for modification
	// MODIFIES: N/A
	// EFFECTS: traverses the document until it finds a table, then calls helpers to search the rows
	public async traverseNode(curr: any, dataset: Dataset, fromIndex: PartialRoom) {
		if (!curr.childNodes) {
			return;
		}
		if (curr.tagName === "table" && this.validTableBuilding(curr.childNodes)) {
			if (!this.checkHeaders(curr.childNodes)) {
				return new InsightError("missing a header!");
			}
			const traverser: ParseBuildingFile = new ParseBuildingFile();
			try {
				this.foundFlag = true;
				await traverser.geoLocation(curr.childNodes, dataset, fromIndex);
			} catch (e) {
				throw new InsightError("caught an error while searching rows");
			}
			return; // return here, only one valid table so once we find don't need to keep going
		}
		for (let trait of curr.childNodes) {
			if (!trait.childNodes) {
				continue;
			}
			this.traverseNodes(trait.childNodes, dataset, fromIndex);
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
					if (validator.checkValidClassBuildingFile(trait.value)) {
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
			if (headerText === "views-field views-field-field-room-number"
				|| headerText === "views-field-field-room-number views-field") {
				b0 = true;
				continue;
			}
			if (headerText === "views-field views-field-field-room-capacity"
				|| headerText === "views-field-field-room-capacity views-field") {
				b1 = true;
				continue;
			}
			if (headerText === "views-field views-field-field-room-furniture"
				|| headerText === "views-field-field-room-furniture views-field") {
				b2 = true;
				continue;
			}
			if (headerText === "views-field views-field-field-room-type"
				|| headerText === "views-field-field-room-type views-field") {
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

	// REQUIRES: the list of childnodes passed by traverseNode, the dataset object
	// MODIFIES: N/A
	// EFFECTS: traverses the list of nodes mutually recursively
	public traverseNodes(childNodeList: any, dataset: Dataset, fromIndex: PartialRoom) {
		for (let node of childNodeList) {
			if (!node.childNodes || this.fitsExclusion(node.nodeName)) { // if the node doesn't have children, continue, otherwise search the children
				continue;
			}
			if (this.foundFlag) {
				return;
			}
			this.traversePromises.push(this.traverseNode(node, dataset, fromIndex));
		}
	}


}

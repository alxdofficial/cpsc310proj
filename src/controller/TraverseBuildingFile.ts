import fs from "fs-extra";
import JSZip from "jszip";
import {parse} from "parse5";
import * as http from "http";
import Section from "./Section";
import {QueryParser} from "./ParseQuery";
import {DataProcessor, PartialRoom} from "./DataProcessor";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import {Dataset} from "./Dataset";
import {ParseIndexFile} from "./ParseIndexFile";
import {ParseBuildingFile} from "./ParseBuildingFile";
import {TableValidity} from "./TableValidity";


export class TraverseBuildingFile extends TableValidity {

	public findHTMLNode(doc: any, dataset: Dataset, fromIndex: PartialRoom) {
		for (let i = 0; i < doc.childNodes.length; i++) {
			this.findHTMLNodeName(doc.childNodes[i], i, dataset, fromIndex);
		}
	}

	public findHTMLNodeName(childNode: any, i: number, dataset: Dataset, fromIndex: PartialRoom) {
		if (childNode.nodeName === "html") {
			try {
				this.traverseNode(childNode, dataset, fromIndex);
			} catch (e) {
				console.log("caught an error" + e);
			}
		}
	}

	// REQUIRES: the HTML Document object with its traits and a dataset to pass for modification
	// MODIFIES: N/A
	// EFFECTS: traverses the document until it finds a table, then calls helpers to search the rows
	public traverseNode(curr: any, dataset: Dataset, fromIndex: PartialRoom) {
		console.log("in traverse");
		if (!curr.childNodes) {
			return;
		}
		if (curr.tagName === "table" && this.validTableBuilding(curr.childNodes)) {
			const traverser: ParseBuildingFile = new ParseBuildingFile();
			try {
				traverser.searchRows(curr.childNodes, dataset, fromIndex);
			} catch (e) {
				throw new InsightError("caught and error while searching rows");
			}
			// .catch(() => {
			// 	throw new InsightError();
			// });
			return; // return here, only one valid table so once we find don't need to keep going
		}
		for (let trait of curr.childNodes) {
			if (!trait.childNodes) {
				continue;
			}
			this.traverseNodes(trait.childNodes, dataset, fromIndex);
		}
	}

	// REQUIRES: the list of childnodes passed by traverseNode, the dataset object
	// MODIFIES: N/A
	// EFFECTS: traverses the list of nodes mutually recursively
	public traverseNodes(childNodeList: any, dataset: Dataset, fromIndex: PartialRoom) {
		for (let node of childNodeList) {
			if (!node.childNodes || this.fitsExclusion(node.nodeName)) { // if the node doesn't have children, continue, otherwise search the children
				continue;
			}
			this.traverseNode(node, dataset, fromIndex);
		}
	}


}

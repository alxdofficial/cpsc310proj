import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";

import fs from "fs-extra";
import JSZip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private readonly datasets: string[];

	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.datasets = [];							// Initialize an empty array of strings that will contain the currently added Dataset IDs
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (this.invalidID(id)) {					// Check that the id is valid
			return Promise.reject(new InsightError("Invalid ID!"));
		}

		if (this.duplicateID(id)) {					// Check that there isn't a dataset already added with the same ID
			return Promise.reject(new InsightError("Duplicate ID!"));
		}

		return new Promise((resolve, reject) => {
			try {
				const contentLoaded = this.loadContent(id, content);
				if (contentLoaded instanceof InsightError) {
					return reject(new InsightError());
				} else {
					return resolve(contentLoaded);
				}
			} catch (e) {
				return reject(new InsightError());
			}
		});

		// return Promise.reject("Not implemented.");
	}

	public invalidID(id: string): boolean {
		try {
			if (id.includes("_")) {  										// If it has an underscore, return false
				return true;
			} else if (id === "") {  										// If it is only the empty string,
				return true;
			} else if (!id.replace(/\s/g, "").length) { // https://stackoverflow.com/questions/10261986/how-to-detect-string-which-contains-only-spaces
				return true;												// If the string length after removing all spaces is 0 ie: only spaces
			}
		} catch (e) {														// If for some reason the argument passed is not a string, throw an InsightError
			throw new InsightError();
		}
		return false;														// Otherwise, return true
	}

	public duplicateID(id: string): boolean {
		for (const item of this.datasets) {		// Iterate over the list of dataset ids, if contains current then return true, other wise return false
			if (item === id) {
				return true;
			}
		}
		return false;
	}
// TODO: Implement load content
	public loadContent(id: string, content: string): string[] | InsightError {
		const zip = new JSZip();
		zip.loadAsync(content, {base64: true})
			.then(() => {
				// load file, iterate over to make a new sections objectt

			}

			) // If successful load, save it onto the disk
			.catch(() => new InsightError()); // If fails for some reason, return new InsightError
		return []; // stub
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {		// Settling this promise: This promise only fufills, either an empty array or array of current datasets
		return Promise.reject("Not implemented.");
	}
}

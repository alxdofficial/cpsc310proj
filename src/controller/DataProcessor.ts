import {InsightDatasetKind} from "./IInsightFacade";
import JSZip from "jszip";
import {Dataset} from "./Dataset";


export interface PartialRoom {

	fullName: string;
	shortName: string;
	lat: number;
	lon: number;
	address: string;
	path: string;
}

export interface DataProcessor {
	// Abstraction of the methods its subtypes will implement such that we depend on abstraction rather than concrete
	// impl.


	// REQUIRES: An InsightFacade instance
	// EFFECTS: Adds the dataset to memory
	// MODIFIES: Moves datasets from disk into memory
	addOnKind(dataset: Dataset): Promise<string[]>;


	parse(str: string, dataset: Dataset): any;


	iterateFolders(zip: JSZip, dataset: Dataset): any;


}

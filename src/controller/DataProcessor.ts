import {InsightDatasetKind} from "./IInsightFacade";
import JSZip from "jszip";
import {Dataset} from "./Dataset";

export interface DataProcessor {
	// Abstraction of the methods its subtypes will implement such that we depend on abstraction rather than concrete
	// impl.

	// REQUIRES: An InsightFacade instance
	// EFFECTS: Checks the archive if a dataset exists
	// MODIFIES: Moves datasets from disk into memory
	crashRecovery(): any;

	// REQUIRES: An InsightFacade instance
	// EFFECTS: Adds the dataset to memory
	// MODIFIES: Moves datasets from disk into memory
	addOnKind(dataset: Dataset): Promise<string[]>;


	parse(str: string, dataset: Dataset): any;


	fieldIsUndefined(jsonObject: any): boolean;

	iterateFolders(zip: JSZip, dataset: Dataset): any;


}

import fs from "fs-extra";
import JSZip from "jszip";
import Section from "./Section";
import {QueryParser} from "./ParseQuery";
import {InsightQuery} from "./InsightQuery";
import {DatasetUtils} from "./DatasetUtils";
import {DataProcessor} from "./DataProcessor";
import {InsightDatasetKind} from "./IInsightFacade";
import {Dataset} from "./Dataset";


export class AddRoom implements DataProcessor{
	public addOnKind(dataset: Dataset): Promise<string[]> {
		return Promise.resolve([]);
	}

	public crashRecovery() {
	}

	public fieldIsUndefined(jsonObject: any): boolean {
		return false;
	}

	public iterateFolders(zip: JSZip) {
	}

	public parse(str: string) {
	}


}

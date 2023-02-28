import {InsightError} from "./IInsightFacade";
import fs from "fs-extra";

export class DatasetUtils {
	public checkDataExists(): boolean {
		return fs.existsSync("./data"); // does the data file exist?
	}
}

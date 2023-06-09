import InsightFacade from "../InsightFacade";
import {InsightDataset, InsightError} from "../IInsightFacade";
import Section from "../Section";
import Room from "../Room";

export class GetDataset {
	public static getDataset(facade: InsightFacade, id: string): Promise<Array<Section | Room>> {
		return new Promise((resolve, reject) => {
			try {
				// check our dataset exists, and reject error if not
				let allDatasets: Map<InsightDataset, Array<Section | Room>> = facade.getAllDatasets();
				let matchingKey: InsightDataset | null = this.findMatchingKey(allDatasets, id);
				if (matchingKey == null) {
					return reject(new InsightError("no matching key found for referenced dataset id"));
				}
				let data: Array<Section | Room> | undefined = allDatasets.get(matchingKey);
				if (data === undefined) {
					return reject(new InsightError("retrieving data from dataset failed"));
				}
				return resolve(data);
			} catch (err) {
				return reject(new InsightError("getting datasets failed"));
			}
		});
	}

	private static findMatchingKey(alldatasets: Map<InsightDataset, Array<Section | Room>>, id: string) {
		for (let key of alldatasets.keys()) {
			if (key.id === id) {
				return key;
			}
		}
		return null;
	}
}

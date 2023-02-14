import InsightFacade from "./InsightFacade";
import {clearDisk, getContentFromArchives} from "../../test/TestUtil";
import {InsightDatasetKind} from "./IInsightFacade";


let json = {
	WHERE: {
		GT: {
			sections_avg: 60
		}
	},
	OPTIONS: {
		COLUMNS: [
			"sections_dept",
			"sections_avg"
		],
		ORDER: "sections_avg"
	}
};
let json2 = {
	WHERE: {
		AND: [
			{
				IS: {
					sections_dept: "cpsc"
				}
			},
			{
				GT: {
					sections_avg: 70
				}
			}
		]
	},
	OPTIONS: {
		COLUMNS: [
			"sections_dept",
			"sections_avg"
		],
		ORDER: "sections_avg"
	}
};

let json3 = {
	WHERE: {
		EQ: {
			se234234_fail: 97
		}
	},
	OPTIONS: {
		COLUMNS: [
			"sections_dept",
			"sections_avg"
		],
		ORDER: "sections_avg"
	}
};
let json4 = {
	WHERE: {
		NOT: {
			GT: {
				se234234_avg: 13456
			}
		}
	},
	OPTIONS: {
		COLUMNS: [
			"sections_dept",
			"sections_avg"
		],
		ORDER: "sections_avg"
	}
};

clearDisk();
const facade: InsightFacade = new InsightFacade();
facade.addDataset("sections",getContentFromArchives("pairLite.zip"),InsightDatasetKind.Sections).then(
).then(function () {
	return facade.performQuery(json2);
}).then(function (output) {
	console.log(output);
}).then(function () {
	clearDisk();
});



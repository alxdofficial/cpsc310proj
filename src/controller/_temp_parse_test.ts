import {QueryParser} from "./ParseQuery";

let json = {
	WHERE: {
		GT: {
			sections_avg: 97
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
					sections_dept: "math"
				}
			},
			{
				LT: {
					sections_avg: 50
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
		GT: {
			se234234_avg: 97
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
const newParser: QueryParser = new QueryParser(json3);
newParser.getQuery();

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
const newParser: QueryParser = new QueryParser(json2);
newParser.getQuery();

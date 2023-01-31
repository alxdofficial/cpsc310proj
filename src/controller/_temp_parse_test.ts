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
// console.log(json);
// let nowherejson = {
// 	sdfghj: {
// 		GT: {
// 			sections_avg: 97
// 		}
// 	},
// 	OPTIONS: {
// 		COLUMNS: [
// 			"sections_dept",
// 			"sections_avg"
// 		],
// 		ORDER: "sections_avg"
// 	}
// };
const newParser: QueryParser = new QueryParser(json);
newParser.getQuery();

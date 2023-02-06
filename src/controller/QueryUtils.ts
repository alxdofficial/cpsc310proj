import {
	InsightFilter,
	InsightM, InsightOption,
	Logic,
	LogicComparison,
	MComparison,
	MFields,
	Negation,
	SComparison, SFields, WildcardPosition
} from "./InsightQuery";

// provides a bunch of helper functions and stores the id of the dataset the query is reffered to
export class QueryUtils {
	public id: string = ""; // this is just for the parser to keep track of so that it can instantiate the insightquery object with the right id
	// return a logicComparison or null if failed to parse
	public multiplexInput(key: string, json: any): InsightFilter | null {
		switch (key) {
			case "AND":
				return this.logicHelper(Logic.And, json);
			case "OR":
				return this.logicHelper(Logic.Or, json);
			case "LT":
				return this.MHelper(InsightM.lt, json);
			case "GT":
				return this.MHelper(InsightM.gt, json);
			case "EQ":
				return this.MHelper(InsightM.eq, json);
			case "IS":
				return this.SHelper(json);
			case "NOT":
				return this.NHelper(json);
			default:
				// unrecognized key
				console.log("unrecognized filter key: " + key);
				return null;
		}
	}
	private logicHelper(logic: Logic, filters: any[]): LogicComparison | null {
		// first check length of input array >= 1
		if (filters.length < 1) {
			return null;
		}
		let arrayFilters: InsightFilter[] = [];
		// for each clause in input json, call helper to parse it into InsightFilters, add to array
		let i = 0;
		while (i < filters.length) {
			let filter = filters[i];
			let filterObject: InsightFilter | null = this.multiplexInput(Object.keys(filter)[0],
				filter[Object.keys(filter)[0]]);
			// if any clause failed to parse, fail.
			if (filterObject == null) {
				console.log("one clause in logic comparison failed to parse");
				return null;
			} else {
				arrayFilters.push(filterObject);
			}
			i++;
		}
		// create Logic comp object
		return new LogicComparison(logic,arrayFilters);
	}
	// return a MComparison or null if failed to parse
	private MHelper(math: InsightM, json: any): MComparison | null {
		// first check number of keys
		if (Object.keys(json).length > 1) {
			return null;
		}
		// then check if id and field is valid
		let idAndField = this.MgetIdandField(Object.keys(json)[0]);
		if (idAndField == null) {
			return null;
		} else {
			// get numeric target value
			let value = json[Object.keys(json)[0]];
			if (typeof value !== "number") {
				return null;
			}
			// create MComparison object
			return new MComparison(math, idAndField[1], value);
		}
	}
	// return a SComparison or null if failed to parse
	private SHelper(json: any): SComparison | null {
		// first check number of keys
		if (Object.keys(json).length > 1) {
			return null;
		}
		// then check if id and field is valid
		let idAndField = this.SgetIdandField(Object.keys(json)[0]);
		if (idAndField == null) {
			return null;
		} else {
			// get string target value and parse wildcard
			let valueAndWC = this.getSvalueAndWildCard(json[Object.keys(json)[0]]);
			if (valueAndWC == null) {
				return null;
			}
			// create MComparison object
			return new SComparison(idAndField[1], valueAndWC[0], valueAndWC[1]);
		}
	}
	// return a Negation or null if failed to parse
	private NHelper(json: any): Negation | null {
		if (json.length > 1) {
			console.log("too many filters in negation");
			return null;
		}
		// console.log(Object.keys(json)[0]);
		// console.log(json[Object.keys(json)[0]]);
		let filter = this.multiplexInput(Object.keys(json)[0], json[Object.keys(json)[0]]);
		if (filter == null) {
			console.log("a valid filter could not be parsed for negation");
			return null;
		} else {
			return new Negation(filter);
		}
	}
	// helper that takes a string, gets the id portion, sets the id field of this object if it hasnt been set yet or the gotten id is equal to the current id, and also the field portion. returns null if either is invalid
	private MgetIdandField(text: string): [string, MFields] | null {
		let firstUS: number = text.indexOf("_");
		let id = text.substring(0,firstUS);
		if (this.id === "" || this.id === id) {
			this.id = id;
		} else {
			console.log("this query refers to multiple datasets");
			return null;
		}
		let fieldString: string = text.substring(firstUS + 1);
		switch (fieldString) {
			case "avg":
				return [id, MFields.avg];
			case "pass":
				return [id, MFields.pass];
			case "fail":
				return [id, MFields.fail];
			case "audit":
				return [id, MFields.audit];
			case "year":
				return [id, MFields.year];
			default:
				console.log("either id or field couldnt be parsed or is incorrect type");
				return null;
		}
	}
	private SgetIdandField(text: string): [string, SFields] | null {
		let firstUS: number = text.indexOf("_");
		let id = text.substring(0,firstUS);
		if (this.id === "" || this.id === id) {
			this.id = id;
		} else {
			console.log("this query refers to multiple datasets");
			return null;
		}
		let fieldString: string = text.substring(firstUS + 1);
		switch (fieldString) {
			case "dept":
				return [id, SFields.dept];
			case "id":
				return [id, SFields.id];
			case "instructor":
				return [id, SFields.instructor];
			case "title":
				return [id, SFields.title];
			case "uuid":
				return [id, SFields.uuid];
			default:
				console.log("either id or field couldnt be parsed or is incorrect type");
				return null;
		}
	}
	private getSvalueAndWildCard (target: any): [WildcardPosition, string] | null {
		// screen for when input is not a string
		if (typeof target !== "string") {
			console.log("S target value is not string");
			return null;
		}
		// start with no WC
		let WC: WildcardPosition = WildcardPosition.none;
		let targetString: string = "";
		// check for *blah
		if (target.charAt(0) === "*") {
			WC = WildcardPosition.front;
		} else {
			targetString += target.charAt(0);
		}
		// check for bla*h illegal
		for (let i = 1; i < target.length - 1; i++) {
			if (target.charAt(i) === "*") {
				console.log("found wildcard in the middle of text. not allowed");
				return null;
			}
			targetString += target.charAt(i);
		}
		// check for blah* or *blah*
		if (target.charAt(target.length - 1) === "*") {
			if (WC === WildcardPosition.front) {
				WC = WildcardPosition.both;
			} else {
				WC = WildcardPosition.end;
			}
		} else {
			targetString += target.charAt(target.length - 1);
		}
		return [WC, targetString];
	}
	// given json, returns insight option object, and null if parsing error.
	public parseOptions(json: any): InsightOption | null {
		// check that COLUMNS exist
		if (json["COLUMNS"] === undefined) {
			console.log("COLUMNS key dont exist");
			return null;
		}
		let columns = json["COLUMNS"];
		if (columns.length < 1) {
			console.log("no colmns in column key");
			return null;
		}
		// get each column
		let arrayColumns: Array<MFields | SFields> = [];
		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let i = 0;i < columns.length;i++) {
			let idColumn: [string, MFields] | [string, SFields] | null = this.SgetIdandField(columns[i]);
			if (idColumn == null) {
				idColumn = this.MgetIdandField(columns[i]);
			}
			if (idColumn == null) {
				console.log("one of the columns could not be parsed");
				return null;
			}
			arrayColumns.push(idColumn[1]);
		}
		// check we have at least 1 validated column
		if (arrayColumns.length < 1) {
			console.log("no valid columns in options");
			return null;
		}
		// check an ORDER is specified
		let order: MFields | SFields | null = null;
		if (json["ORDER"] !== undefined) {
			let idColumn: [string, MFields] | [string, SFields] | null = this.SgetIdandField(json["ORDER"]);
			if (idColumn == null) {
				idColumn = this.MgetIdandField(json["ORDER"]);
			}
			if (idColumn !== null) {
				// since we have a specified order, check that its one of the display columns
				let orderColumn = idColumn[1];
				if (columns.includes(orderColumn)) {
					order = orderColumn;
				}
			}
		}
		// create the option object and return it
		return new InsightOption(arrayColumns,order);
	}
}

import {WildcardPosition} from "../query/SComparison";

export class StringandWCGetter {

	public static getSvalueAndWildCard (target: any): [WildcardPosition, string] | null {
		// screen for when input is not a string
		if (typeof target !== "string") {
			// console.log("S target value is not string");
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
				// console.log("found wildcard in the middle of text. not allowed");
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

}

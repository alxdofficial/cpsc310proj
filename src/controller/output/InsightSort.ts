import Room from "../Room";
import Section from "../Section";
import {MFields, SFields} from "../query/InsightQuery";

export class InsightSort {
	private direction: Dir;
	private keys: string[];
	constructor(dir: Dir, keys: string[]) {
		this.direction = dir;
		this.keys = keys;
	}

	// assume entry A and B are of same type at this point because a call to checkFieldFOrSort have been made
	public static sortFn = (entryA: Room | Section, entryB: Room | Section
		, fieldList: Array<MFields | SFields>): number => {
		return 0;
	};

	// function to check if two entries of data can be compared for sorting, if not, the caller will detect this and throw error
	public static checkFieldsForSort(entryA: Room | Section, entryB: Room | Section
		, fieldList: Array<MFields | SFields>): boolean {
		return false;
	}
}


enum Dir {
	"up", "down"
}


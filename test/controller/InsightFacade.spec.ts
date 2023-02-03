import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult, NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let oneInvalidSection: string;
	let threeCourses: string;
	let sectionsLite: string;
	let sectionsLiteLite: string;
	let invalidDataset: string;
	let validZipInvalidCourse: string;
	let validZipNoValidSection: string;

	let validZipEmptyCourses: string;
	let validZipNoValidJSONFormat: string;

	before(function () {
		// This block runs once and loads the datasets.

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			sections = getContentFromArchives("pair.zip");
			threeCourses = getContentFromArchives("ThreeCourses.zip");
			oneInvalidSection = getContentFromArchives("OneInvalidSection.zip");
			sectionsLite = getContentFromArchives("pairLite.zip");
			sectionsLiteLite = getContentFromArchives("pairLiteLite.zip");
			invalidDataset = getContentFromArchives("invalid-dataset.xlsx");
			validZipInvalidCourse = getContentFromArchives("validZipInvalidCourse.zip");
			validZipEmptyCourses = getContentFromArchives("validZipEmptyCourses.zip");
			validZipNoValidSection = getContentFromArchives("validZipNoValidSections.zip");
			validZipNoValidJSONFormat = getContentFromArchives("validZipNoValidJSONFormat.zip");
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			clearDisk();
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});

		// This is a unit test. You should create more like this!
		it("should reject with  an empty dataset id", function () {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		describe("addDataset", function () { // Tests for an empty dataset id
			it("should reject with  an empty dataset id", function () {
				const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("addDataSetValidIDInvalidDataset", function () { // Tests for an validID but invalid dataset
			it("should reject with  an invalid dataset file type but valid id", function () {
				const result = facade.addDataset("validKey", invalidDataset, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("addDataSet validZipinvalidcourse", function () { // Tests for an validID but courses are not in a valid courses/ folder
			it("should reject with a valid zip file but invalid course folder but valid id", function () {
				const result = facade.addDataset("validKey", validZipInvalidCourse, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		// describe("addDataSet validZipEmpty courses", function () { // Tests for an validID but courses folder is empty
		// 	it("should reject with  an empty dataset but valid id", function () {
		// 		const result = facade.addDataset("validKey", validZipEmptyCourses, InsightDatasetKind.Sections);
		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
		// 	});
		// });

		describe("addDataSet invalidKind", function () { // Tests for an invalid kind from the enum, rooms is invalid
			it("should reject with invalid kind", function () {
				const result = facade.addDataset("validKey", validZipEmptyCourses, InsightDatasetKind.Rooms);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("addDataSet underscoreInKey", function () { // Tests a key with an underscore, should fail with InsightError as mentioned in the interface spec
			it("should reject with invalid key type", function () {
				const result = facade.addDataset("valid_key", sectionsLite, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("addDataSet duplicate key", function () { // Tests a key with an underscore, should fail with InsightError as mentioned in the interface spec
			it("should reject with duplicate keys", function () {
				const result = facade.addDataset("validKey", sectionsLite, InsightDatasetKind.Sections)
					.then(() => facade.addDataset("validKey", sectionsLite, InsightDatasetKind.Sections));
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		// describe("addDataset with empty course folder", function () {
		// 	it("should reject with no sections in the dataset, an empty courses folder", function () {
		// 		const result = facade.addDataset("validKey", validZipEmptyCourses, InsightDatasetKind.Sections);
		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
		// 	});
		// });

		describe("addDataset with non empty courses folder but no valid sections", function () {
			it("should reject with no valid sections in the dataset", function () {
				const result = facade.addDataset("validKey", validZipNoValidSection, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("addDataset with non empty courses folder but invalid JSON format in sections", function () {
			it("should reject with no valid JSON format in the dataset", function () {
				const result = facade.addDataset("validKey", validZipNoValidJSONFormat, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("addData with valid add", function () {
			it("should pass and return the key", function () {
				const result = facade.addDataset("validKey", sections, InsightDatasetKind.Sections);
				return expect(result).to.eventually.deep.equal(["validKey"]);
			});
		});

		describe("addData with an invalid add wrapped in two valid adds", function () {
			it("should fail with InsightError, invalid add wrapped between two valid ones", function () {
				const result = facade.addDataset("validKey", sectionsLite, InsightDatasetKind.Sections)
					.then(() => facade.addDataset("", sectionsLite, InsightDatasetKind.Sections))
					.then(() => facade.addDataset("valid", sectionsLite, InsightDatasetKind.Sections));
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("addData with a VALID add, pairLiteLite has only one course with two sections inside", function () {
			it("should PASS with the valid added key passed", function () {
				const result = facade.addDataset("validKey", sectionsLiteLite, InsightDatasetKind.Sections);
				return expect(result).to.eventually.deep.equal(["validKey"]);
			});
		});


		describe("addData with an invalid add and one valid add", function () {
			it("should fail with InsightError, invalid ID add with valid after", function () {
				const result = facade.addDataset("", sectionsLite, InsightDatasetKind.Sections)
					.then(() => facade.addDataset("valid", sectionsLite, InsightDatasetKind.Sections));
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("addData with a valid add followed by an invalid add", function () {
			it("should fail with InsightError, valid add first then invalid ID add", function () {
				const result = facade.addDataset("valid", sectionsLite, InsightDatasetKind.Sections)
					.then(() => facade.addDataset("", sectionsLite, InsightDatasetKind.Sections));
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("add with one valid section in course, and one invalid", function () {
			it("should pass and return the id of the added set, only one section in the array", function () {
				const result = facade.addDataset("valid", oneInvalidSection, InsightDatasetKind.Sections);
				return expect(result).to.eventually.deep.equal(["valid"]);
			});
		});
		describe("addData with a valid add followed by an invalid file type add", function () {
			it("should fail with InsightError, valid add first then invalid file type add", function () {
				const result = facade.addDataset("valid", sectionsLite, InsightDatasetKind.Sections)
					.then(() => facade.addDataset("validTwo", invalidDataset, InsightDatasetKind.Sections)); // Catches the fail
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("addData with an invalid file type add then an invalid filetype", function () {
			it("should fail with InsightError, invalid first filetype but valid name", function () {
				const result = facade.addDataset("valid", invalidDataset, InsightDatasetKind.Sections) // Catches the fail
					.then(() => facade.addDataset("validTwo", invalidDataset, InsightDatasetKind.Sections));
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("addData with a valid file type, expect sectionLite", function () {
			it("should pass with and return valid as key, length of 1", function () {
				const result = facade.addDataset("valid", sectionsLite, InsightDatasetKind.Sections);
				return expect(result).to.eventually.have.members(["valid"]).lengthOf(1);
			});
		});

		describe("addData with three sections, expect not only CONS sections", function () {
			it("should pass with validThree as key, length of 1", function () {
				const result = facade.addDataset("validThree", threeCourses, InsightDatasetKind.Sections);
				return expect(result).to.eventually.have.members(["validThree"]).lengthOf(1);
			});
		});


		describe("list datasets with no datasets added", function () {
			it("should pass with an empty array", function () {
				const result = facade.listDatasets();
				return expect(result).to.eventually.deep.equal([]);
			});
		});

		// ### Remove dataset

		describe("removeDataset invalidID in an empty set", function () { // Tests for an whitespaceID which is invalid
			it("should reject with invalid, whitespace ID and empty dataset", function () {
				const result = facade.removeDataset(""); // whitespace but also does not exist, cannot exist as a dataset with blank id
				return expect(result).to.eventually.be.rejectedWith(InsightError); // because invalid key, and not found
			});
		});

		describe("removeDataset nonexistentID in non empty set", function () { // Tests for a nonexistent ID which is invalid, in a non-empty dataset
			it("should reject with invalid, non_existent_key and non-empty dataset", function () {
				const result = facade.addDataset("validKey", sections, InsightDatasetKind.Sections)
					.then(() => facade.removeDataset("nonExistentKey"));
				return expect(result).to.eventually.be.rejectedWith(NotFoundError); // this key is not found
			});
		});

		describe("removeDataset whitespace id in non empty set", function () { // Tests for a nonexistent ID which is invalid, in a non-empty dataset
			it("should reject with invalid, whitespace id and non-empty dataset", function () {
				const result = facade.addDataset("existentKey", sections, InsightDatasetKind.Sections)
					.then(() => facade.removeDataset(""));
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("removeDataset nonexistentID in empty set", function () { // Tests for a nonexistent ID which is invalid, in an empty dataset
			it("should reject with a non existing ID and empty dataset", function () {
				const result = facade.removeDataset("nonExistentKey");
				return expect(result).to.eventually.be.rejectedWith(NotFoundError);
			});
		});

		describe("removeDataset invalid id string in non empty set", function () { // Tests for a nonexistent ID which is invalid, in a non-empty dataset
			it("should reject with invalid, invalid_key id and non-empty dataset", function () {
				const result = facade.addDataset("existentKey", sectionsLite, InsightDatasetKind.Sections)
					.then(() => facade.removeDataset("in_valid_key"));
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});
		describe("removeDataset with valid key and set", function () { // Tests for a nonexistent ID which is invalid, in a non-empty dataset
			it("should PASS with the removed ID", function () {
				const result = facade.addDataset("existentKey", sectionsLite, InsightDatasetKind.Sections)
					.then(() => facade.removeDataset("existentKey"));
				return expect(result).to.eventually.equal("existentKey");
			});
		});


		describe("removeDataset two datasets, fails first", function () {
			it("should fail. tries to remove a non existing before an existing", function () {
				const result = facade.addDataset("validKeyTwo", sections, InsightDatasetKind.Sections)
					.then(() => facade.removeDataset("validKeyFour"))// Does not exist, calls goes to catch and rejects
					.then(() => facade.removeDataset("validKeyTwo"));
				return expect(result).to.eventually.be.rejectedWith(NotFoundError);
			});
		});

		describe("removeDataset two datasets, fails between", function () {
			it("should fail with InsightError, tries to remove a non before and after an existing", function () {
				const result = facade.addDataset("validKey", sections, InsightDatasetKind.Sections)
					.then(() => facade.addDataset("validKeyTwo", sections, InsightDatasetKind.Sections))
					.then(() => facade.removeDataset("validKey"))
					.then(() => facade.removeDataset("validKeyFour")) // Does not exist, goes to catch and rejects
					.then(() => facade.removeDataset("validKeyTwo"));
				return expect(result).to.eventually.be.rejectedWith(NotFoundError);
			});
		});

	});


	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the query's directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery ORDERED", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/orderedqueries",
			{
				assertOnResult: (actual, expected) => {
					expect(actual).to.deep.equal(expected);					// Deep equals checks for members and order, implementation change states that order may not matter anymore
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "InsightError") {							// Is it an InsightError?
						expect(actual).to.be.instanceof(InsightError);			// Assert that it will be an instance of
					} else if (expected === "ResultTooLargeError") {			// Is it a RTLE?
						expect(actual).to.be.instanceof(ResultTooLargeError);	// Assert that it will be
					} else {
						// this should be unreachable
						expect.fail("UNEXPECTED ERROR");						// Unreachable, assert on error should only be called with errors
					}
				},
			}
		);
	});

	describe("PerformQuery UNORDERED", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/unorderedqueries",
			{
				assertOnResult: async (actual, expected) => { // TODO figure out this error
					expect(actual).to.have.members(await expected);					// Member equality without order
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "InsightError") {							// Is it an InsightError?
						expect(actual).to.be.instanceof(InsightError);			// Assert that it will be an instance of
					} else if (expected === "ResultTooLargeError") {			// Is it a RTLE?
						expect(actual).to.be.instanceof(ResultTooLargeError);	// Assert that it will be
					} else {
						// this should be unreachable
						expect.fail("UNEXPECTED ERROR");						// Unreachable, assert on error should only be called with errors
					}
				},
			}
		);
	});
});


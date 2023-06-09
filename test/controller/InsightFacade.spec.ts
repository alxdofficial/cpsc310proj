/*
import {
 	IInsightFacade,
 	InsightDatasetKind,
 	InsightError,
 	InsightResult,
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
 	let campus: string;
 	let campusLite: string;
 	let campusLiteInvalidBuildings: string;
 	let campusMissingRoomTD: string;
 	let campusNoTableInIndex: string;
 	let campusLiteESBInvalidAddress: string;
 	let campusLiteEmptyESBShort: string;
 	let campusLiteMissingHeadersInIndex: string;
 	let campusLiteMissingHeadersInBuilding: string;
 	let campusIndexNotInRoot: string;
 	let campusWoodMissingHeader: string;
 	let woodMissingSomeCap: string;
 	let allBuildingsMissingColumn: string;
 	let twoTables: string;
 	let tableAtEnd: string;
 	let twoExtraTablesInESB: string;
 	let missingHeaderInWOOD: string;
 	let oneInvalidSection: string;
 	let threeCourses: string;
 	let noCoursesFolder: string;
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
 			campus = getContentFromArchives("campus.zip");
 			// campusLite = getContentFromArchives("campusLite.zip");
 			// campusLiteInvalidBuildings = getContentFromArchives("campusLiteInvalidBuildings.zip"); // ESB is missing the address TD, so we shouldn't see any ESB rooms
 			// campusMissingRoomTD = getContentFromArchives("campusMissingRoomTD.zip"); // One of WOOD's rooms is missing the capacity class, so num rows should be 20 for Lite
 			// campusNoTableInIndex = getContentFromArchives("campusNoTableInIndex.zip");
 			// campusLiteESBInvalidAddress = getContentFromArchives("campusLiteESBInvalidAddress.zip");
 			// campusLiteEmptyESBShort = getContentFromArchives("campusLiteEmptyESBShort.zip");
 			// campusLiteMissingHeadersInIndex = getContentFromArchives("campusLiteMissingHeadersInIndex.zip");
 			// campusLiteMissingHeadersInBuilding = getContentFromArchives("campusLiteMissingHeadersInBuilding.zip");
 			// campusIndexNotInRoot = getContentFromArchives("campusIndexNotInRoot.zip");
 			// campusWoodMissingHeader = getContentFromArchives("campusWoodMissingHeader.zip");
 			// woodMissingSomeCap = getContentFromArchives("woodMissingSomeCap.zip");
 			// twoTables = getContentFromArchives("twoTables.zip");
 			// tableAtEnd = getContentFromArchives("tableAtEnd.zip");
 			// twoExtraTablesInESB = getContentFromArchives("twoExtraTablesInESB.zip");
 			// missingHeaderInWOOD = getContentFromArchives("missingHeaderInWOOD.zip");
 			// allBuildingsMissingColumn = getContentFromArchives("allBuildingsMissingColumn.zip");
 			// threeCourses = getContentFromArchives("ThreeCourses.zip");
 			// noCoursesFolder = getContentFromArchives("noCoursesFolderButSectionInside.zip");
 			// oneInvalidSection = getContentFromArchives("OneInvalidSection.zip");
 			// sectionsLite = getContentFromArchives("pairLite.zip");
 			// sectionsLiteLite = getContentFromArchives("pairLiteLite.zip");
 			// invalidDataset = getContentFromArchives("invalid-dataset.xlsx");
 			// validZipInvalidCourse = getContentFromArchives("validZipInvalidCourse.zip");
 			// validZipEmptyCourses = getContentFromArchives("validZipEmptyCourses.zip");
 			// validZipNoValidSection = getContentFromArchives("validZipNoValidSections.zip");
 			// validZipNoValidJSONFormat = getContentFromArchives("validZipNoValidJSONFormat.zip");
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

 		// describe("all building files are missing one column header, katharine said all columns will have a hgeader",
 		// 	function () {
 		// 		it("should be rejected as there will be no valid rooms", function () {
 		// 			const result = facade.addDataset("allBuildingsMissingColumn",
 		// 				allBuildingsMissingColumn, InsightDatasetKind.Rooms);
 		// 			return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 		});
 		// 	});

 		describe("addDataset with a valid ROOMs dataset", function () {
 			it("should be added and return a set of the currently added room IDS", function () {
 				const result = facade.addDataset("campus", campus, InsightDatasetKind.Rooms);
 				return expect(result).to.eventually.deep.equal(["campus"]);
 			});
 		});
 		//
 		// describe("should pass and return the key", function () {
 		// 	it("should be added and return a set of the currently added room IDS", function () {
 		// 		const result = facade.addDataset("twoExtraTablesInESB", twoExtraTablesInESB, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.deep.equal(["twoExtraTablesInESB"]);
 		// 	});
 		// });
 		//
 		// describe("missing a table header in WOOD, should skip the wood building file", function () {
 		// 	it("should pass with no WOOD rooms", function () {
 		// 		const result = facade.addDataset("missingHeaderInWOOD", missingHeaderInWOOD, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.deep.equal(["missingHeaderInWOOD"]);
 		// 	});
 		// });
 		//
 		// describe("index has talbe at end", function () {
 		// 	it("should fulfil with the table at the end of the index file", function () {
 		// 		const result = facade.addDataset("tableAtEnd",
 		// 			tableAtEnd, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.deep.equal(["tableAtEnd"]);
 		// 	});
 		// });
 		//
 		// describe("index not in root", function () {
 		// 	it("should be rejected", function () {
 		// 		const result = facade.addDataset("campusIndexNotInRoot",
 		// 			campusIndexNotInRoot, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("two tables, second one is the valid one", function () {
 		// 	it("should fulfil with rooms in WOOD", function () {
 		// 		const result = facade.addDataset("twoTables",
 		// 			twoTables, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.deep.equal(["twoTables"]);
 		// 	});
 		// });
 		//
 		//
 		// describe("woodMissingSomeCapacity, but field exists", function () {
 		// 	it("should fulfil with some capacities as 0", function () {
 		// 		const result = facade.addDataset("woodMissingSomeCap",
 		// 			woodMissingSomeCap, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.deep.equal(["woodMissingSomeCap"]);
 		// 	});
 		// });
 		//
 		// describe("WOOD missing table column, so skip wood", function () {
 		// 	it("should be accepted without wood rooms", function () {
 		// 		const result = facade.addDataset("campusWoodMissingHeader",
 		// 			campusWoodMissingHeader, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.deep.equal(["campusWoodMissingHeader"]);
 		// 	});
 		// });
 		//
 		// describe("ROOMS empty ESB short NAME", function () {
 		// 	it("should be added and return a set of the currently added room IDS", function () {
 		// 		const result = facade.addDataset("campusLiteEmptyESBShort",
 		// 			campusLiteEmptyESBShort, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.deep.equal(["campusLiteEmptyESBShort"]);
 		// 	});
 		// });
 		// describe("trying to add rooms with section type", function () {
 		// 	it("reject because opposite type", function () {
 		// 		const result = facade.addDataset("campusLiteEmptyESBShort",
 		// 			campusLiteEmptyESBShort, InsightDatasetKind.Sections);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		// describe("addDataset with a valid ROOMs dataset AND valid SECTIONS", function () {
 		// 	it("should be added and return a set of the currently added room IDS", function () {
 		// 		const result = facade.addDataset("campus", campus, InsightDatasetKind.Rooms)
 		// 			.then(() => facade.addDataset("sections", sectionsLiteLite, InsightDatasetKind.Sections));
 		// 		return expect(result).to.eventually.deep.equal(["campus", "sections"]);
 		// 	});
 		// });
 		// // // 24 valid rooms in LITE
 		// // describe("addDataset with a valid LITE ROOMs, some building files in index do not exist", function () {
 		// // 	it("should be added and return a set of the currently added room IDS", function () {
 		// // 		const result = facade.addDataset("campusLite", campusLite, InsightDatasetKind.Rooms)
 		// // 			.then(() => {
 		// // 				const newFacade = new InsightFacade();
 		// // 				console.log(newFacade.listDatasets());
 		// // 			});
 		// // 		const newDataSet: InsightDataset = {							// Create the dataset tuple
 		// // 			id: "campusLite",
 		// // 			kind: InsightDatasetKind.Rooms,
 		// // 			numRows: 24
 		// // 		};
 		// // 		return expect(result).to.eventually.deep.equal(newDataSet);
 		// // 	});
 		// // });
 		// //
 		//
 		// // 20 valid rooms in LITE without one in ESB and WOOD
 		// describe("addDataset with a valid LITE ROOMs, ESB is missing address TD in index", function () {
 		// 	it("should be added and return a set of the currently added room IDS", function () {
 		// 		const result = facade.addDataset("campusMissingRoomTD", campusMissingRoomTD, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.deep.equal(["campusMissingRoomTD"]);
 		// 	});
 		// });
 		//
 		// // 0 rooms because no table in index.htm
 		// describe("addDataset with a no table in Index.htm", function () {
 		// 	it("should throw insighterror with 0 valid rooms", function () {
 		// 		const result = facade.addDataset("campusNoTableInIndex",
 		// 			campusNoTableInIndex, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// //
 		// describe("addDataset ESB has invalid address", function () {
 		// 	it("should skip ESB and fulfill without ESB rooms", function () {
 		// 		const result = facade.addDataset("campusLiteESBInvalidAddress",
 		// 			campusLiteESBInvalidAddress, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.deep.equal(["campusLiteESBInvalidAddress"]);
 		// 	});
 		// });
 		//
 		// describe("Missing a table header", function () {
 		// 	it("Missing a table header in Index", function () {
 		// 		const result = facade.addDataset("campusLiteMissingHeadersInIndex",
 		// 			campusLiteMissingHeadersInIndex, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("removeDataset with a valid LITE ROOMs, ESB is missing address TD in index", function () {
 		// 	it("should be added and return a set of the currently added room IDS", function () {
 		// 		const result = facade.addDataset("campusMissingRoomTD", campusMissingRoomTD, InsightDatasetKind.Rooms)
 		// 			.then(() => facade.removeDataset("campusMissingRoomTD"));
 		// 		return expect(result).to.eventually.deep.equal("campusMissingRoomTD");
 		// 	});
 		// });
 		//
 		// describe("removeDataset with a valid ROOMs dataset AND valid SECTIONS", function () {
 		// 	it("should be added and return a set of the currently added room IDS", function () {
 		// 		const result = facade.addDataset("campusLite", campusLite, InsightDatasetKind.Rooms)
 		// 			.then(() => facade.addDataset("sections", sectionsLiteLite, InsightDatasetKind.Sections))
 		// 			.then(() => facade.removeDataset("campusLite"))
 		// 			.then(() => facade.removeDataset("sections"));
 		// 		return expect(result).to.eventually.deep.equal("sections");
 		// 	});
 		// });
 		//
 		// // 21 valid rooms in LITE without ESB
 		// describe("addDataset with a valid LITE ROOMs, WOOD room is missing cap in building file", function () {
 		// 	it("3should be added and return a set of the currently added room IDS", function () {
 		// 		const result = facade.addDataset("campusLiteInvalidBuildings",
 		// 			campusLiteInvalidBuildings, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.deep.equal(["campusLiteInvalidBuildings"]);
 		// 	});
 		// });
 		//
 		// // 364 valid rooms in campus
 		// describe("removeDataset with a valid ROOMs dataset", function () {
 		// 	it("should be removed with the string CAMPUS", function () {
 		// 		const result = facade.addDataset("campus", campus, InsightDatasetKind.Rooms)
 		// 			.then(() => facade.removeDataset("campus"));
 		// 		return expect(result).to.eventually.deep.equal("campus");
 		// 	});
 		// });
 		//
 		// describe("addDataset with a valid ROOMs dataset, wrong kind", function () {
 		// 	it("should NOT be added and return an InsightError", function () {
 		// 		const result = facade.addDataset("campus", campus, InsightDatasetKind.Sections);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("Missing table header in BUILDING", function () {
 		// 	it("should NOT be added and return an InsightError", function () {
 		// 		const result = facade.addDataset("campusLiteMissingHeadersInBuilding",
 		// 			campusLiteMissingHeadersInBuilding, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.be.deep.equal(["campusLiteMissingHeadersInBuilding"]);
 		// 	});
 		// });


 		//
 		// // This is a unit test. You should create more like this!
 		// it("should reject with  an empty dataset id", function () {
 		// 	const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
 		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// });
 		//
 		// describe("addDataset", function () { // Tests for an empty dataset id
 		// 	it("should reject with  an empty dataset id", function () {
 		// 		const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("addDataSetValidIDInvalidDataset", function () { // Tests for an validID but invalid dataset
 		// 	it("should reject with  an invalid dataset file type but valid id", function () {
 		// 		const result = facade.addDataset("validKey", invalidDataset, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("addDataSet validZipinvalidcourse", function () { // Tests for an validID but courses are not in a valid courses/ folder
 		// 	it("should reject with a valid zip file but invalid course folder but valid id", function () {
 		// 		const result = facade.addDataset("validKey", validZipInvalidCourse, InsightDatasetKind.Sections);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		//
 		// describe("addDataSet invalidKind", function () { // Tests for an invalid kind from the enum, rooms is invalid
 		// 	it("should reject with invalid kind", function () {
 		// 		const result = facade.addDataset("validKey", validZipEmptyCourses, InsightDatasetKind.Rooms);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("addDataSet underscoreInKey", function () { // Tests a key with an underscore, should fail with InsightError as mentioned in the interface spec
 		// 	it("should reject with invalid key type", function () {
 		// 		const result = facade.addDataset("valid_key", sectionsLite, InsightDatasetKind.Sections);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("addDataSet duplicate key", function () { // Tests a key with an underscore, should fail with InsightError as mentioned in the interface spec
 		// 	it("should reject with duplicate keys", function () {
 		// 		const result = facade.addDataset("validKey", sectionsLite, InsightDatasetKind.Sections)
 		// 			.then(() => facade.addDataset("validKey", sectionsLite, InsightDatasetKind.Sections));
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("addDataset with no courses folder, but sections inside", function () {
 		// 	it("should reject with no courses folder, but has sections inside", function () {
 		// 		const result = facade.addDataset("validKey", noCoursesFolder, InsightDatasetKind.Sections);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("addDataset with non empty courses folder but no valid sections", function () {
 		// 	it("should reject with no valid sections in the dataset", function () {
 		// 		const result = facade.addDataset("validKey", validZipNoValidSection, InsightDatasetKind.Sections);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("addDataset with non empty courses folder but invalid JSON format in sections", function () {
 		// 	it("should reject with no valid JSON format in the dataset", function () {
 		// 		const result = facade.addDataset("validKey", validZipNoValidJSONFormat, InsightDatasetKind.Sections);
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("addData with valid add", function () {
 		// 	it("should pass and return the key", function () {
 		// 		const result = facade.addDataset("validKey", sections, InsightDatasetKind.Sections);
 		// 		return expect(result).to.eventually.deep.equal(["validKey"]);
 		// 	});
 		// });
 		//
 		// describe("addData with an invalid add wrapped in two valid adds", function () {
 		// 	it("should fail with InsightError, invalid add wrapped between two valid ones", function () {
 		// 		const result = facade.addDataset("validKey", sectionsLite, InsightDatasetKind.Sections)
 		// 			.then(() => facade.addDataset("", sectionsLite, InsightDatasetKind.Sections))
 		// 			.then(() => facade.addDataset("valid", sectionsLite, InsightDatasetKind.Sections));
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("addData with a VALID add, pairLiteLite has only one course with two sections inside", function () {
 		// 	it("should PASS with the valid added key passed", function () {
 		// 		const result = facade.addDataset("validKey", sectionsLiteLite, InsightDatasetKind.Sections);
 		//
 		// 		return expect(result).to.eventually.deep.equal(["validKey"]);
 		// 	});
 		// });
 		//
 		// describe("addData with a list and VALID add, pairLiteLite has only one course with two sections inside",
 		// 	function () {
 		// 		it("should PASS with the valid added key passed", function () {
 		// 			const result = facade.addDataset("validKey", sectionsLiteLite, InsightDatasetKind.Sections)
 		// 				.then(() => facade.listDatasets());
 		// 			const newDataSet: InsightDataset = {							// Create the dataset tuple
 		// 				id: "validKey",
 		// 				kind: InsightDatasetKind.Sections,
 		// 				numRows: 33
 		// 			};
 		//
 		// 			return expect(result).to.eventually.deep.equal([newDataSet]);
 		// 		});
 		// 	});
 		//
 		// describe("addData with a ROOMS and VALID add", function () {
 		// 	it("should PASS with the valid added key passed", function () {
 		// 		const result = facade.addDataset("campusLite", campusLite, InsightDatasetKind.Rooms)
 		// 			.then(() => facade.listDatasets());
 		// 		const newDataSet: InsightDataset = {							// Create the dataset tuple
 		// 			id: "campusLite",
 		// 			kind: InsightDatasetKind.Rooms,
 		// 			numRows: 24
 		// 		};
 		//
 		// 		return expect(result).to.eventually.deep.equal([newDataSet]);
 		// 	});
 		// });

 		//
 		// describe("addData with two VALID adds, pairLiteLite has only one course with two sections inside", function () {
 		// 	it("should PASS with both valid keys added", function () {
 		// 		const result = facade.addDataset("validKey", sectionsLiteLite, InsightDatasetKind.Sections)
 		// 			.then(()=> facade.addDataset("validKeyTwo", sectionsLiteLite, InsightDatasetKind.Sections));
 		// 		return expect(result).to.eventually.deep.equal(["validKey", "validKeyTwo"]);
 		// 	});
 		// });
 		//
 		// describe("addData with two VALID adds, pairLiteLite and three courses", function () {
 		// 	it("should PASS with both valid keys added", function () {
 		// 		const result = facade.addDataset("validKeyThree", threeCourses, InsightDatasetKind.Sections)
 		// 			.then(()=> facade.addDataset("validKeyFour", sectionsLiteLite, InsightDatasetKind.Sections));
 		// 		return expect(result).to.eventually.deep.equal(["validKeyThree", "validKeyFour"]);
 		// 	});
 		// });
 		//
 		//
 		// describe("addData with an invalid add and one valid add", function () {
 		// 	it("should fail with InsightError, invalid ID add with valid after", function () {
 		// 		const result = facade.addDataset("", sectionsLite, InsightDatasetKind.Sections)
 		// 			.then(() => facade.addDataset("valid", sectionsLite, InsightDatasetKind.Sections));
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("addData with a valid add followed by an invalid add", function () {
 		// 	it("should fail with InsightError, valid add first then invalid ID add", function () {
 		// 		const result = facade.addDataset("valid", sectionsLite, InsightDatasetKind.Sections)
 		// 			.then(() => facade.addDataset("", sectionsLite, InsightDatasetKind.Sections));
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("add with one valid section in course, and one invalid", function () {
 		// 	it("should pass and return the id of the added set, only one section in the array", function () {
 		// 		const result = facade.addDataset("valid", oneInvalidSection, InsightDatasetKind.Sections);
 		// 		return expect(result).to.eventually.deep.equal(["valid"]);
 		// 	});
 		// });
 		// describe("addData with a valid add followed by an invalid file type add", function () {
 		// 	it("should fail with InsightError, valid add first then invalid file type add", function () {
 		// 		const result = facade.addDataset("valid", sectionsLite, InsightDatasetKind.Sections)
 		// 			.then(() => facade.addDataset("validTwo", invalidDataset, InsightDatasetKind.Sections)); // Catches the fail
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("addData with an invalid file type add then an invalid filetype", function () {
 		// 	it("should fail with InsightError, invalid first filetype but valid name", function () {
 		// 		const result = facade.addDataset("valid", invalidDataset, InsightDatasetKind.Sections) // Catches the fail
 		// 			.then(() => facade.addDataset("validTwo", invalidDataset, InsightDatasetKind.Sections));
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
 		// 	});
 		// });
 		//
 		// describe("addData with a valid file type, expect sectionLite", function () {
 		// 	it("should pass with and return valid as key, length of 1", function () {
 		// 		const result = facade.addDataset("valid", sectionsLite, InsightDatasetKind.Sections);
 		// 		return expect(result).to.eventually.have.members(["valid"]).lengthOf(1);
 		// 	});
 		// });
 		//
 		// describe("addData with three sections, expect not only CONS sections", function () {
 		// 	it("should pass with validThree as key, length of 1", function () {
 		// 		const result = facade.addDataset("validThree", threeCourses, InsightDatasetKind.Sections);
 		// 		return expect(result).to.eventually.have.members(["validThree"]).lengthOf(1);
 		// 	});
 		// });
 		//
 		//
 		// describe("list datasets with no datasets added", function () {
 		// 	it("should pass with an empty array", function () {
 		// 		const result = facade.listDatasets();
 		// 		return expect(result).to.eventually.deep.equal([]);
 		// 	});
 		// });
 		//
 		// describe("list datasets with two datasets added", function () {
 		// 	it("should pass with an array with both dsets", async function () {
 		// 		let resultIDOne;
 		// 		let resultIDTwo;
 		// 		let resultArr: string[] = [];
 		// 		 const result = await facade.addDataset("valid", threeCourses, InsightDatasetKind.Sections)
 		// 			.then(() => facade.addDataset("validTwo", threeCourses, InsightDatasetKind.Sections))
 		// 			.then(() => facade.listDatasets());
 		// 		const newDataSetOne: InsightDataset = {
 		// 			id: "valid",
 		// 			kind: InsightDatasetKind.Sections,
 		// 			numRows: 283
 		// 		};
 		// 		const newDataSetTwo: InsightDataset = {
 		// 			id: "validTwo",
 		// 			kind: InsightDatasetKind.Sections,
 		// 			numRows: 283
 		// 		};
 		// 		resultIDOne = result[0].id;
 		// 		resultIDTwo = result[1].id;
 		// 		resultArr.push(resultIDOne);
 		// 		resultArr.push(resultIDTwo);
 		//
 		// 		return expect(resultArr).to.have.members([newDataSetOne.id, newDataSetTwo.id]);
 		// 	});
 		// });
 		//
 		// // ### Remove dataset
 		//
 		// describe("removeDataset invalidID in an empty set", function () { // Tests for an whitespaceID which is invalid
 		// 	it("should reject with invalid, whitespace ID and empty dataset", function () {
 		// 		const result = facade.removeDataset(""); // whitespace but also does not exist, cannot exist as a dataset with blank id
 		// 		return expect(result).to.eventually.be.rejectedWith(InsightError); // because invalid key, and not found
 		// 	});
 		// });
 		//
 		// describe("removeDataset nonexistentID in non empty set", function () { // Tests for a nonexistent ID which is invalid, in a non-empty dataset
 		// 	it("should reject with invalid, non_existent_key and non-empty dataset", function () {
 		// 		const result = facade.addDataset("validKey", sections, InsightDatasetKind.Sections)
 		// 			.then(() => facade.removeDataset("nonExistentKey"));
 		// 		return expect(result).to.eventually.be.rejectedWith(NotFoundError); // this key is not found
 		// 	});
 		// });
 		//

		describe("removeDataset whitespace id in non empty set", function () { // Tests for a nonexistent ID which is invalid, in a non-empty dataset
			it("should reject with invalid, whitespace id and non-empty dataset", function () {
				const result = facade.addDataset("existentKey", sections, InsightDatasetKind.Sections)
					.then(() => facade.removeDataset(""));
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});
		//
		// describe("removeDataset nonexistentID in empty set", function () { // Tests for a nonexistent ID which is invalid, in an empty dataset
		// 	it("should reject with a non existing ID and empty dataset", function () {
		// 		const result = facade.removeDataset("nonExistentKey");
		// 		return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		// 	});
		// });
		//
		// describe("removeDataset invalid id string in non empty set", function () { // Tests for a nonexistent ID which is invalid, in a non-empty dataset
		// 	it("should reject with invalid, invalid_key id and non-empty dataset", function () {
		// 		const result = facade.addDataset("existentKey", sectionsLite, InsightDatasetKind.Sections)
		// 			.then(() => facade.removeDataset("in_valid_key"));
		// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
		// 	});
		// });
		describe("removeDataset with valid key and set", function () { // Tests for a nonexistent ID which is invalid, in a non-empty dataset
			it("should PASS with the removed ID", function () {
				const result = facade.removeDataset("sections");
				return expect(result).to.eventually.equal("sections");
			});
		});
		//
		//
		// describe("removeDataset two datasets, fails first", function () {
		// 	it("should fail. tries to remove a non existing before an existing", function () {
		// 		const result = facade.addDataset("validKeyTwo", sections, InsightDatasetKind.Sections)
		// 			.then(() => facade.removeDataset("validKeyFour"))// Does not exist, calls goes to catch and rejects
		// 			.then(() => facade.removeDataset("validKeyTwo"));
		// 		return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		// 	});
		// });
		//
		// describe("removeDataset two datasets, fails between", function () {
		// 	it("should fail with InsightError, tries to remove a non before and after an existing", function () {
		// 		const result = facade.addDataset("validKey", sections, InsightDatasetKind.Sections)
		// 			.then(() => facade.addDataset("validKeyTwo", sections, InsightDatasetKind.Sections))
		// 			.then(() => facade.removeDataset("validKey"))
		// 			.then(() => facade.removeDataset("validKeyFour")) // Does not exist, goes to catch and rejects
		// 			.then(() => facade.removeDataset("validKeyTwo"));
		// 		return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		// 	});
		// });

	});


 */


/*
 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
 * You should not need to modify it; instead, add additional files to the query's directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
/*
	describe("PerformQuery ORDERED", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
			clearDisk();

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				 // facade.addDataset("sections", sections, InsightDatasetKind.Sections),
				 facade.addDataset("rooms", campus, InsightDatasetKind.Rooms),
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
			"./test/resources/roomsOrdered",
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

*/

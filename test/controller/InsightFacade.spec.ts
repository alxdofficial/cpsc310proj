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

describe("insight facade", function () {
	let sections: string; // the parsed zip file to be passed into add dataset
	let facade: InsightFacade;
	let smallfile: string;
	before(function () {
		sections = getContentFromArchives("pair.zip");
		smallfile = getContentFromArchives("gooddata.zip");
	});

	beforeEach( function () {
		facade = new InsightFacade();

	});

	describe("add dataset" , function () {
		beforeEach(function () {
			clearDisk();
		});

		it("should fail due to empty string as id", function () {
			const result = facade.addDataset("", smallfile, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
				// must write return due to syntax
		});
		it("should fail due to underscore in id", function () {
			const result = facade.addDataset("_1", smallfile, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should fail due to id only having space", function () {
			const result = facade.addDataset("  ", smallfile, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should fail due to duplicate id", function () {
			return facade.addDataset("gabagoo", smallfile, InsightDatasetKind.Sections).then(function () {
				return facade.addDataset("gabagoo", smallfile, InsightDatasetKind.Sections);
			}).then(function () {
				expect.fail("shouldnt be able to add duplicate id dataset");
			}).catch(function (err) {
				return expect(err).to.be.instanceOf(InsightError);
			});
		});
		it("should fail: no courses subdir in zip", function () {
			let baddata = getContentFromArchives("baddata-no-courses-dir.zip");
			const result = facade.addDataset("1", baddata, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should fail: no valid courses (no results key)", function () {
			let baddata = getContentFromArchives("baddata-no-results.zip");
			const result = facade.addDataset("1", baddata, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should fail: invalid section (not all query keys present)", function () {
			let baddata = getContentFromArchives("baddata-incomplete-section-fields.zip");
			const result = facade.addDataset("1", baddata, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should fail due to no sections", function () {
			let baddata = getContentFromArchives("baddata-no-sections.zip");
			const result = facade.addDataset("dfghjk", baddata, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should fail because result not a list", function () {
			let baddata = getContentFromArchives("baddata-result-not-a-list.zip");
			const result = facade.addDataset("dfghjk", baddata, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should pass due to good data", function () {
			let gooddata = getContentFromArchives("gooddata.zip");
			const result = facade.addDataset("dfghjk", gooddata, InsightDatasetKind.Sections);
			return result.then(function (ret) {
				expect(ret).to.equal(["dfghjk"]);
			}).catch(function () {
				expect.fail("good add dataset, shouldnt have error");
			});
		});
		it("should pass due to file containing valid section although also contains empty sections", function () {
			let gooddata = getContentFromArchives("gooddata2.zip");
			const result = facade.addDataset("dfghjk", gooddata, InsightDatasetKind.Sections);
			return result.then(function (ret) {
				expect(ret).to.equal(["dfghjk"]);
			}).catch(function () {
				expect.fail("good add dataset, shouldnt have error");
			});
		});
		it("should pass even though some section fields are empty stirng", function () {
			let gooddata = getContentFromArchives("gooddata3.zip");
			const result = facade.addDataset("dfghjk", gooddata, InsightDatasetKind.Sections);
			return result.then(function (ret) {
				expect(ret).to.equal(["dfghjk"]);
			}).catch(function () {
				expect.fail("good add dataset, shouldnt have error");
			});
		});
	}
	);

	describe("remove dataset", function () {
		beforeEach(function () {
			clearDisk();
		});

		it("should fail due to invalid id: ''", function () {
			return facade.addDataset("24564",smallfile,InsightDatasetKind.Sections).then(function ()  {
				return facade.removeDataset("");
			}
			).then(function () {
				expect.fail("should not succeed");
			}).catch(function (error) {
				expect(error).to.be.instanceOf(InsightError);
			});

		});

		// move add dataset to each of the tests (inside), follow syntax above, add .then(expect fail), and add .catch(expect error to be insight error/appropriate error)
		it("should fail due to invalid id: '_'", function () {
			return facade.addDataset("12345",smallfile,InsightDatasetKind.Sections).then(function () {
				return facade.removeDataset("_hjfgm");
			}).then(function (){
				expect.fail("_ not allowed in idstring");
			}).catch(function (err) {
				expect(err).to.be.instanceOf(InsightError);
			});
		});
		it("should fail due to invalid id: only space'", function () {
			return facade.addDataset("12345",sections,InsightDatasetKind.Sections).then(function () {
				return facade.removeDataset("   ");
			}).then(function (){
				expect.fail("shouldnt get to here: id string with just whitespace.");
			}).catch(function (err) {
				expect(err).to.be.instanceOf(InsightError);
			});
		});
		it("should fail due to non existent id'", function () {
			return facade.addDataset("12345",sections,InsightDatasetKind.Sections).then(function () {
				return facade.removeDataset("blahblahnotarealidgfghgfgh");
			}).then(function (){
				expect.fail("shouldnt get to here: non existent id");
			}).catch(function (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			});
		});
		it("should fail due to non existent id (already removed)'", function () {
			return facade.addDataset("12345",sections,InsightDatasetKind.Sections).then(function () {
				return facade.removeDataset("12345");
			}).then(function (){
				return facade.removeDataset("12345");
			}).then(function (){
				expect.fail("shouldnt get to here: already removed");
			}).catch(function (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			});
		});
		it("remove should pass", function () {
			return facade.addDataset("12345", sections, InsightDatasetKind.Sections).then(function (){
				return facade.removeDataset("12345");
			}).then(function (result) {
				return expect(result).to.equals("12345");
			}).catch(function () {
				expect.fail("shoudlnt fail on good remove");
			});
		});
		it("remove should pass2", function () {
			return facade.addDataset("23456",sections,InsightDatasetKind.Sections).then( function () {
				return facade.removeDataset("23456");
			}).then( function (result) {
				expect(result).to.equals("23456");
			}).catch(function () {
				expect.fail("should not fail on good remove");
			});
		});
	});

	describe("list dataset", function () {
		beforeEach(function () {
			clearDisk();
		});
		it("list dataset with no datasets should pass", function () {
			const ans = facade.listDatasets();
			return expect(ans).to.eventually.be.deep.equals([]);
		});
		it("should return correct insight dataset object", function () {
			const ans = facade.addDataset("12345", sections, InsightDatasetKind.Sections).then(function() {
				return facade.listDatasets();
			}).then(function () {
				expect(ans).to.deep.equals([{id:"12345", kind:InsightDatasetKind.Sections, numRows:64612}]);
			}).catch(function () {
				expect.fail("should not catch error");
			});
			return ans;
		});
		it("list dataset with duplicate dataset should fail", function () {
			return facade.addDataset("12345", sections, InsightDatasetKind.Sections).then(function () {
				return facade.addDataset("12345", sections, InsightDatasetKind.Sections);
			}).then(function () {
				expect.fail("shoudnt even be able to add dupicate dataset");
			}).catch(function (err) {
				expect(err).to.be.instanceOf(InsightError);
			});
		});
		it("list dataset with multiple datasets should work", function () {
			const ans = facade.addDataset("12345", sections, InsightDatasetKind.Sections).then(function () {
				return facade.addDataset("23456", sections, InsightDatasetKind.Sections);
			}).then(function () {
				return facade.listDatasets();
			}).then(function () {
				expect(ans).to.be.deep.equals([{id:"12345", kind:InsightDatasetKind.Sections, numRows:64612},
					{id:"23456", kind:InsightDatasetKind.Sections, numRows:64612}]);
			}).catch(function () {
				expect.fail("should not have errror");
			});
			return ans;

		});

	});

	describe("query", function () {
		before(function () {
			clearDisk();
			// add a valid dataset to facade
			// must return or else chai will not wait for add dataest to complte
			return facade.addDataset("sections",sections,InsightDatasetKind.Sections).then(function () {
				return facade.addDataset("ubc",sections,InsightDatasetKind.Sections);
			});
		});
		it("should fail due to not a query object", function () {
			const result = facade.performQuery({random:"object"});
			return expect(result).to.eventually.rejectedWith(InsightError);
		});

		// folder test
		type Input = any;
		type Output = Promise<InsightResult[]>;
		async function assertResult(actual: unknown, expected: Output, input: Input): Promise<void> {
			if (Object.keys(input["OPTIONS"]).includes("ORDER")) {
				expect(actual).to.deep.ordered.members(await expected);
			} else {
				expect(actual).to.deep.equal(expected);
			}
		}

		// add test that returned result is sorted in the correct order as specified in query


		// Assert actual error is of expected type
		type Errorstrings = "InsightError" | "ResultTooLargeError";
		function assertError(actual: unknown, expected: Errorstrings): void {
			if (expected === "InsightError") {
				expect(actual).to.be.an.instanceOf(InsightError);
			} else if (expected === "ResultTooLargeError") {
				expect(actual).to.be.instanceOf(ResultTooLargeError);
			}
		}

		folderTest<unknown, Output, Errorstrings>(
			"folder tests",                               // suiteName
			(input: Input): Output => facade.performQuery(input),      // target
			"./test/resources/queries",                   // path
			{
				assertOnResult: assertResult,
				assertOnError: assertError,                 // options
			}
		);

		//     tyhj
	});
});


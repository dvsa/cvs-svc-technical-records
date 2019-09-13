import {expect} from "chai";
import LambdaTester from "lambda-tester";
import {getTechRecords as GetTechRecordsFunction} from "../../src/functions/getTechRecords";
import {populateDatabase} from "../util/dbOperations";

describe("getTechRecords", () => {
  beforeAll(async (done) => {
    await populateDatabase();
    done();
  });
  context("when the path is invalid", () => {
    it("should return 400", () => {
      // Event has a path, but the path does not contain a Search Term
      return LambdaTester(GetTechRecordsFunction)
        .event({
          path: "test"
        })
        .expectResolve((result: any) => {
          expect(result.statusCode).to.equal(400);
          // Path checking now handled in the handler. Now only checking for Path Params
          expect(result.body).to.equal('"The search identifier should be between 3 and 21 characters."');
        });
    });
  });

  context("when the path is valid", () => {
    context("and the vehicle was found", () => {
      it("should return 200", () => {

        return LambdaTester(GetTechRecordsFunction)
          .event({
            path: "/vehicles/XMGDE02FS0H012345/tech-records",
            pathParameters: {
              searchIdentifier: "XMGDE02FS0H012345"
            },
            queryStringParameters: {
              status: "current"
            }
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).to.equal(200);
            expect(JSON.parse(result.body).vin).to.equal("XMGDE02FS0H012345");
          });
      });
    });

    context("and the vehicle was not found", () => {
      it("should return 404", () => {
        return LambdaTester(GetTechRecordsFunction)
          .event({
            path: "/vehicles/ABCDE02FS0H012345/tech-records",
            pathParameters: {
              searchIdentifier: "ABCDE02FS0H012345"
            }
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).to.equal(404);
            expect(result.body).to.equal('"No resources match the search criteria."');
          });
      });
    });

    context("and the search identifier is lower than 3", () => {
      it("should return 400", () => {
        return LambdaTester(GetTechRecordsFunction)
          .event({
            path: "/vehicles/XM/tech-records",
            pathParameters: {
              searchIdentifier: "XM"
            }
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).to.equal(400);
            expect(result.body).to.equal('"The search identifier should be between 3 and 21 characters."');
          });
      });
    });
  });
  beforeEach(() => {
    jest.setTimeout(5000);
  });
  afterEach(() => {
    jest.setTimeout(5000);
  });
});

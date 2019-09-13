import TechRecordsDao from "../../src/models/TechRecordsDAO";
import AWS from "aws-sdk";
import chai from "chai";
import sinon, {SinonStub} from "sinon";
const sandbox = sinon.createSandbox();
const expect = chai.expect;

describe("TechRecordsDAO", () => {
  context("getBySearchTerm", () => {
    context("builds correct request", () => {
      beforeEach(() => {jest.resetModules(); });
      afterEach(() => {sandbox.restore(); });

      it("for Trailer ID (letter and 6 numbers)", async () => {
        const expectedCall = {
          TableName: "cvs-local-technical-records",
          KeyConditionExpression: "#trailerId = :trailerId",
          ExpressionAttributeNames: {
            "#trailerId": "trailerId"
          },
          ExpressionAttributeValues: {
            ":trailerId": "Q000001"
          },
          IndexName: "TrailerIdIndex"
        };
        const stub = mockDocumentClientWithReturn("query", []);
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("Q000001");

        expect(getRequestItemsBodyFromStub(stub)).to.deep.equal(expectedCall);
      });

      it("for Trailer ID (8 numbers)", async () => {
        const expectedCall = {
          TableName: "cvs-local-technical-records",
          KeyConditionExpression: "#trailerId = :trailerId",
          ExpressionAttributeNames: {
            "#trailerId": "trailerId"
          },
          ExpressionAttributeValues: {
            ":trailerId": "12345678"
          },
          IndexName: "TrailerIdIndex"
        };

        const stub = mockDocumentClientWithReturn("query", []);
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("12345678");

        expect(getRequestItemsBodyFromStub(stub)).to.deep.equal(expectedCall);
      });

      it("for Full VIN (>9 chars)", async () => {
        const expectedCall = {
          TableName: "cvs-local-technical-records",
          KeyConditionExpression: "#partialVin = :partialVin AND #vin = :vin",
          ExpressionAttributeNames: {
            "#vin": "vin",
            "#partialVin": "partialVin"
          },
          ExpressionAttributeValues: {
            ":vin": "1234567890",
            ":partialVin": "567890"
          }
        };
        const stub = mockDocumentClientWithReturn("query", []);
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("1234567890");

        expect(getRequestItemsBodyFromStub(stub)).to.deep.equal(expectedCall);
      });

      it("for Partial VIN (6 digits)", async () => {
        const expectedCall = {
          TableName: "cvs-local-technical-records",
          KeyConditionExpression: "#partialVin = :partialVin",
          ExpressionAttributeNames: {
            "#partialVin": "partialVin"
          },
          ExpressionAttributeValues: {
            ":partialVin": "123456"
          }
        };

        const stub = mockDocumentClientWithReturn("query", []);
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("123456");

        expect(getRequestItemsBodyFromStub(stub)).to.deep.equal(expectedCall);
      });

      it("for VRM (8 chars, not matching Trailer Pattern)", async () => {
        const expectedCall = {
          TableName: "cvs-local-technical-records",
          KeyConditionExpression: "#vrm = :vrm",
          ExpressionAttributeNames: {
            "#vrm": "primaryVrm"
          },
          ExpressionAttributeValues: {
            ":vrm": "1234567A"
          },
          IndexName: "VRMIndex"
        };

        const stub = mockDocumentClientWithReturn("query", []);
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("1234567A");

        expect(getRequestItemsBodyFromStub(stub)).to.deep.equal(expectedCall);
      });

      it("for VRM (3 chars)", async () => {
        const expectedCall = {
          TableName: "cvs-local-technical-records",
          KeyConditionExpression: "#vrm = :vrm",
          ExpressionAttributeNames: {
            "#vrm": "primaryVrm"
          },
          ExpressionAttributeValues: {
            ":vrm": "67A"
          },
          IndexName: "VRMIndex"
        };

        const stub = mockDocumentClientWithReturn("query", []);
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("67A");

        expect(getRequestItemsBodyFromStub(stub)).to.deep.equal(expectedCall);
      });

      // <3 or >21 chars handled in getTechRecords Function, so only cursory checks here.
      it("for Non-matching pattern (2 chars)", async () => {
        const techRecordsDao = new TechRecordsDao();
        techRecordsDao.getBySearchTerm("7A")
          .then(() => {
            expect.fail();
          })
          .catch((e: any) => {
            expect(e.statusCode).to.equal(400);
            expect(e.code).to.equal("ValidationException");
          });
      });
    });
  });
});

const getRequestBody = (dao: any) => {
  return dao.$response.request.httpRequest.body;
};

const getRequestItemsBodyFromStub = (input: SinonStub) => {
    return input.args[0][0];
};

function mockDocumentClientWithReturn(method: "batchWrite" | "scan" | "query", retVal: any) {
    const myStub = sinon.stub().callsFake(() => {
        return {
            promise: sinon.fake.resolves(retVal)
        };
    });
    sandbox.replace(AWS.DynamoDB.DocumentClient.prototype, method, myStub);
    return myStub;
}

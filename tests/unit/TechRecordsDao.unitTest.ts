import TechRecordsDao from "../../src/models/TechRecordsDAO";
import AWS from "aws-sdk";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";

describe("TechRecordsDAO", () => {
  context("getBySearchTerm", () => {
    context("builds correct request", () => {
      beforeEach(() => {jest.resetModules(); });
      // Mock once
      let stub: any = null;
      AWS.DynamoDB.DocumentClient.prototype.query = jest.fn().mockImplementation( (params: DocumentClient.QueryInput) => {
        return {
          promise: () => {stub = params; return Promise.resolve([]); }
        };
      });

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
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("Q000001");

        expect(stub).toStrictEqual(expectedCall);
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

        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("12345678");

        expect(stub).toStrictEqual(expectedCall);
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

        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("1234567890");

        expect(stub).toStrictEqual(expectedCall);
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

        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("123456");

        expect(stub).toStrictEqual(expectedCall);
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

        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("1234567A");

        expect(stub).toStrictEqual(expectedCall);
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
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("67A");

        expect(stub).toStrictEqual(expectedCall);
      });

      // <3 or >21 chars handled in getTechRecords Function, so only cursory checks here.
      it("for Non-matching pattern (2 chars)", async () => {
        const expectedCall = {
          TableName: "cvs-local-technical-records",
          KeyConditionExpression: "",
          ExpressionAttributeNames: {},
          ExpressionAttributeValues: {},
        };

        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("7A");
        expect(stub).toStrictEqual(expectedCall);
      });
    });
  });
});

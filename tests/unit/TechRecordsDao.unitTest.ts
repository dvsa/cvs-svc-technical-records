import TechRecordsDao, {
  // capitaliseGeneralVehicleAttributes,
  isPartialVinSearch,
  isTrailerSearch,
  isVinSearch,
  isVrmSearch
} from "../../src/models/TechRecordsDAO";
import AWS from "aws-sdk";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import mockData from "../resources/technical-records.json";
import {cloneDeep} from "lodash";
import {SEARCHCRITERIA} from "../../src/assets/Enums";

describe("TechRecordsDAO", () => {
  describe("is Search Type functions", () => {
    describe("isVinSearch", () => {
      describe("searchCriteria is VIN and non-vin format searchTerm", () => {
        it("still returns true", () => {
          expect(isVinSearch("1", "vin")).toEqual(true);
        });
      });
      describe("searchCriteria is ALL and valid vin format searchTerm", () => {
        it("returns true", () => {
          expect(isVinSearch("1234567890", "all")).toEqual(true);
        });
      });
      describe("searchCriteria is ALL and non-vin format searchTerm", () => {
        it("returns false", () => {
          expect(isVinSearch("1", "all")).toEqual(false);
        });
      });
      describe("searchCriteria is not VIN or ALL", () => {
        it("returns false", () => {
          expect(isVinSearch("1234567890", "vrm")).toEqual(false);
        });
      });
      describe("searchCriteria is ALL and valid vin format searchTerm containing special characters", () => {
        it("returns true", () => {
          expect(isVinSearch("YV31ME00000 1/\\*-1", "all")).toEqual(true);
        });
      });
    });
    describe("isTrailerSearch", () => {
      describe("searchCriteria is TRAILERID and non-trailer format searchTerm", () => {
        it("still returns true", () => {
          expect(isTrailerSearch("1", "trailerId")).toEqual(true);
        });
      });
      describe("searchCriteria is ALL and valid trailer format searchTerm", () => {
        it("returns true", () => {
          expect(isTrailerSearch("12345678", "all")).toEqual(true);
        });
      });
      describe("searchCriteria is ALL and non-trailer format searchTerm", () => {
        it("returns false", () => {
          expect(isTrailerSearch("1", "all")).toEqual(false);
        });
      });
      describe("searchCriteria is not TRAILERID or ALL", () => {
        it("returns false", () => {
          expect(isTrailerSearch("12345678", "vin")).toEqual(false);
        });
      });
      describe("searchCriteria is ALL and non-trailerId format searchTerm (with special characters)", () => {
        it("returns false", () => {
          expect(isTrailerSearch(" /\\*-678", "all")).toEqual(false);
        });
      });
    });
    describe("isPartialVinSearch", () => {
      describe("searchCriteria is PARTIALVIN and non-partialVin format searchTerm", () => {
        it("still returns true", () => {
          expect(isPartialVinSearch("1", "partialVin")).toEqual(true);
        });
      });
      describe("searchCriteria is ALL and valid partialVin format searchTerm", () => {
        it("returns true", () => {
          expect(isPartialVinSearch("123456", "all")).toEqual(true);
        });
      });
      describe("searchCriteria is ALL and non-partialVin format searchTerm", () => {
        it("returns false", () => {
          expect(isPartialVinSearch("1", "all")).toEqual(false);
        });
      });
      describe("searchCriteria is not PARTIALVIN or ALL", () => {
        it("returns false", () => {
          expect(isPartialVinSearch("123456", "vin")).toEqual(false);
        });
      });
      describe("searchCriteria is ALL and partialVin format containing special characters", () => {
        it("returns true", () => {
          expect(isPartialVinSearch(" /\\*-6", "all")).toEqual(true);
        });
      });
      describe("searchCriteria is ALL and non-partialVin format containing special characters", () => {
        it("returns false", () => {
          expect(isPartialVinSearch(" /\\*-A", "all")).toEqual(false);
        });
      });
      describe("searchCriteria is PARTIALVIN and partialVin format containing special characters", () => {
        it("returns true", () => {
          expect(isPartialVinSearch(" /\\*-6", "partialVin")).toEqual(true);
        });
      });
    });
    describe("isVrmSearch", () => {
      describe("searchCriteria is VRM and non-VRM format searchTerm", () => {
        it("still returns true", () => {
          expect(isVrmSearch("1", "vrm")).toEqual(true);
        });
      });
      describe("searchCriteria is ALL and valid VRM format searchTerm", () => {
        it("returns true", () => {
          expect(isVrmSearch("1234", "all")).toEqual(true);
        });
      });
      describe("searchCriteria is ALL and non-VRM format searchTerm", () => {
        it("returns false", () => {
          expect(isVrmSearch("1", "all")).toEqual(false);
        });
      });
      describe("searchCriteria is not VRM or ALL", () => {
        it("returns false", () => {
          expect(isVrmSearch("1234", "vin")).toEqual(false);
        });
      });
      describe("searchCriteria is ALL and valid VRM format searchTerm (with special characters)", () => {
        it("returns true", () => {
          expect(isVrmSearch("12 34", "all")).toEqual(true);
        });
      });
    });
  });
  context("getBySearchTerm", () => {
    context("builds correct request", () => {
      beforeEach(() => {
        jest.resetModules();
      });
      // Mock once
      let stub: any = null;
      AWS.DynamoDB.DocumentClient.prototype.query = jest.fn().mockImplementation((params: DocumentClient.QueryInput) => {
        return {
          promise: () => {
            stub = params;
            return Promise.resolve([]);
          }
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
        await techRecordsDao.getBySearchTerm("Q000001", SEARCHCRITERIA.ALL);

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
        await techRecordsDao.getBySearchTerm("12345678", SEARCHCRITERIA.ALL);

        expect(stub).toStrictEqual(expectedCall);
      });

      it("for Full VIN (>9 chars)", async () => {
        const expectedCall = {
          TableName: "cvs-local-technical-records",
          IndexName: "VinIndex",
          KeyConditionExpression: "#vin = :vin",
          ExpressionAttributeNames: {
            "#vin": "vin"
          },
          ExpressionAttributeValues: {
            ":vin": "1234567890"
          }
        };

        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("1234567890", SEARCHCRITERIA.ALL);

        expect(stub).toStrictEqual(expectedCall);
      });

      it("for Partial VIN (6 digits)", async () => {
        const expectedCall = {
          TableName: "cvs-local-technical-records",
          IndexName: "PartialVinIndex",
          KeyConditionExpression: "#partialVin = :partialVin",
          ExpressionAttributeNames: {
            "#partialVin": "partialVin"
          },
          ExpressionAttributeValues: {
            ":partialVin": "123456"
          }
        };

        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("123456", SEARCHCRITERIA.ALL);

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
        await techRecordsDao.getBySearchTerm("1234567A", SEARCHCRITERIA.ALL);

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
        await techRecordsDao.getBySearchTerm("67A", SEARCHCRITERIA.ALL);

        expect(stub).toStrictEqual(expectedCall);
      });

      // <3 or >21 chars handled in getTechRecords Function, so only cursory checks here.
      it("for Non-matching pattern (2 chars)", async () => {
        const expectedCall = {
          TableName: "cvs-local-technical-records",
          KeyConditionExpression: "",
          IndexName: "",
          ExpressionAttributeNames: {},
          ExpressionAttributeValues: {},
        };

        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("7A", SEARCHCRITERIA.ALL);
        expect(stub).toStrictEqual(expectedCall);
      });

      it("should capitalise the searchTerm", async () => {
        const expectedCall = {
          TableName: "cvs-local-technical-records",
          IndexName: "VinIndex",
          KeyConditionExpression: "#vin = :vin",
          ExpressionAttributeNames: {
            "#vin": "vin"
          },
          ExpressionAttributeValues: {
            ":vin": "ABCD12345NM"
          }
        };

        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.getBySearchTerm("abcd12345Nm", SEARCHCRITERIA.ALL);

        expect(stub).toStrictEqual(expectedCall);
      });
    });
  });

  context("createSingle", () => {
    context("builds correct request", () => {
      beforeEach(() => {
        jest.resetModules();
      });
      // Mock once
      let stub: any = null;
      AWS.DynamoDB.DocumentClient.prototype.put = jest.fn().mockImplementation((params: DocumentClient.Put) => {
        return {
          promise: () => {
            stub = params;
            return Promise.resolve([]);
          }
        };
      });

      it("for valid TechRecord", async () => {
        const techRecord: any = cloneDeep(mockData[0]);

        const expectedCall = {
          TableName: "cvs-local-technical-records",
          Item: techRecord,
          ConditionExpression: "vin <> :vin AND systemNumber <> :systemNumber",
          ExpressionAttributeValues: {
            ":vin": "XMGDE02FS0H012345",
            ":systemNumber": "11000001"
          }
        };
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.createSingle(techRecord);
        expect(stub).toStrictEqual(expectedCall);
      });

      it("for invalid TechRecord", async () => {
        const techRecord: any = cloneDeep(mockData[0]);

        delete techRecord.systemNumber;
        delete techRecord.vin;
        const expectedCall = {
          TableName: "cvs-local-technical-records",
          Item: techRecord,
          ConditionExpression: "vin <> :vin AND systemNumber <> :systemNumber",
          ExpressionAttributeValues: {
            ":vin": undefined,
            ":systemNumber": undefined
          }
        };
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.createSingle(techRecord);
        expect(stub).toStrictEqual(expectedCall);
      });
    });
  });

  context("updateSingle", () => {
    beforeEach(() => {
      jest.resetModules();
    });
    // Mock once
    let stub: any = null;
    AWS.DynamoDB.DocumentClient.prototype.update = jest.fn().mockImplementation((params: DocumentClient.Update) => {
      return {
        promise: () => {
          stub = params;
          return Promise.resolve([]);
        }
      };
    });
    context("builds correct request when only primaryVrm is updated", () => {
      it("should return the correct query", async () => {
        const techRecord: any = cloneDeep(mockData[0]);
        delete techRecord.secondaryVrms;
        delete techRecord.trailerId;

        const expectedCall = {
          TableName: "cvs-local-technical-records",
          Key: {
            systemNumber: "11000001",
            vin: "XMGDE02FS0H012345"
          },
          UpdateExpression: "set techRecord = :techRecord, primaryVrm = :primaryVrm",
          ConditionExpression: "vin = :vin AND systemNumber = :systemNumber",
          ExpressionAttributeValues: {
            ":vin": "XMGDE02FS0H012345",
            ":systemNumber": "11000001",
            ":techRecord": techRecord.techRecord,
            ":primaryVrm": "JY58FPP"
          },
          ReturnValues: "ALL_NEW"
        };
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.updateSingle(techRecord);
        expect(stub).toStrictEqual(expectedCall);
      });
    });

    context("builds correct request when only secondaryVrms are updated", () => {
      it("should return the correct query", async () => {
        const techRecord: any = cloneDeep(mockData[0]);
        delete techRecord.primaryVrm;
        delete techRecord.trailerId;

        const expectedCall = {
          TableName: "cvs-local-technical-records",
          Key: {
            systemNumber: "11000001",
            vin: "XMGDE02FS0H012345"
          },
          UpdateExpression: "set techRecord = :techRecord, secondaryVrms = :secondaryVrms",
          ConditionExpression: "vin = :vin AND systemNumber = :systemNumber",
          ExpressionAttributeValues: {
            ":vin": "XMGDE02FS0H012345",
            ":systemNumber": "11000001",
            ":techRecord": techRecord.techRecord,
            ":secondaryVrms": ["609859Z"]
          },
          ReturnValues: "ALL_NEW"
        };
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.updateSingle(techRecord);
        expect(stub).toStrictEqual(expectedCall);
      });
    });

    context("builds correct request when only trailerId is updated", () => {
      it("should return the correct query", async () => {
        const techRecord: any = cloneDeep(mockData[0]);
        delete techRecord.secondaryVrms;
        delete techRecord.primaryVrm;

        const expectedCall = {
          TableName: "cvs-local-technical-records",
          Key: {
            systemNumber: "11000001",
            vin: "XMGDE02FS0H012345"
          },
          UpdateExpression: "set techRecord = :techRecord, trailerId = :trailerId",
          ConditionExpression: "vin = :vin AND systemNumber = :systemNumber",
          ExpressionAttributeValues: {
            ":vin": "XMGDE02FS0H012345",
            ":systemNumber": "11000001",
            ":techRecord": techRecord.techRecord,
            ":trailerId": "09876543"
          },
          ReturnValues: "ALL_NEW"
        };
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.updateSingle(techRecord);
        expect(stub).toStrictEqual(expectedCall);
      });
    });

    context("builds correct request when only all attributes are updated", () => {
      it("should return the correct query", async () => {
        const techRecord: any = cloneDeep(mockData[0]);

        const expectedCall = {
          TableName: "cvs-local-technical-records",
          Key: {
            systemNumber: "11000001",
            vin: "XMGDE02FS0H012345"
          },
          UpdateExpression: "set techRecord = :techRecord, primaryVrm = :primaryVrm, secondaryVrms = :secondaryVrms, trailerId = :trailerId",
          ConditionExpression: "vin = :vin AND systemNumber = :systemNumber",
          ExpressionAttributeValues: {
            ":vin": "XMGDE02FS0H012345",
            ":systemNumber": "11000001",
            ":techRecord": techRecord.techRecord,
            ":primaryVrm": "JY58FPP",
            ":secondaryVrms": ["609859Z"],
            ":trailerId": "09876543"
          },
          ReturnValues: "ALL_NEW"
        };
        const techRecordsDao = new TechRecordsDao();
        await techRecordsDao.updateSingle(techRecord);
        expect(stub).toStrictEqual(expectedCall);
      });
    });
  });
});

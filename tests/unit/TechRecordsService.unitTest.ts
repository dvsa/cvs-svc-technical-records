/* global describe context it */
import TechRecordsService from "../../src/services/TechRecordsService";
import HTTPError from "../../src/models/HTTPError";
import records from "../resources/technical-records.json";
import {HTTPRESPONSE, SEARCHCRITERIA, STATUS} from "../../src/assets/Enums";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import S3BucketService from "../../src/services/S3BucketService";
import {cloneDeep} from "lodash";
import HTTPResponse from "../../src/models/HTTPResponse";
import * as fs from "fs";
import * as path from "path";
import S3 from "aws-sdk/clients/s3";
import {AWSError, Response} from "aws-sdk";

jest.mock("../../src/services/S3BucketService");
jest.mock("aws-sdk/clients/s3");
const s3BucketServiceMock = new S3BucketService(new S3());

describe("getTechRecordsList", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  context("when db call returns data", () => {
    it("should return a populated response", async () => {
      const techRecord = cloneDeep(records[0]);
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: [techRecord],
              Count: 1,
              ScannedCount: 1
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);


      const returnedRecords: any = await techRecordsService.getTechRecordsList("1B7GG36N12S678410", STATUS.CURRENT, SEARCHCRITERIA.ALL);
      expect(returnedRecords).not.toEqual(undefined);
      expect(returnedRecords).not.toEqual({});
      expect(returnedRecords).toEqual(techRecord);
    });
  });

  context("and the statusCode by which we query is provisional_over_current", () => {
    context("and the result is a techRecord with one provisional entry and one current one", () => {
      it("should return the provisional entry", async () => {
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getBySearchTerm: () => {
              return Promise.resolve({
                Items: [records[9]],
                Count: 1,
                ScannedCount: 1
              });
            }
          };
        });
        const mockDAO = new MockDAO();
        const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

        let expectedResult: ITechRecordWrapper = JSON.parse(JSON.stringify(records[9]));

        expectedResult.techRecord.splice(0, 1);
        expectedResult = techRecordsService.formatTechRecordItemForResponse(expectedResult);
        const returnedRecords = await techRecordsService.getTechRecordsList("YV31MEC18GA011911", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
        expect(returnedRecords).toEqual(expectedResult);
      });
    });

    context("and the result is a techRecord with one archived entry and one current one", () => {
      it("should return the current entry", async () => {
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getBySearchTerm: () => {
              return Promise.resolve({
                Items: [records[10]],
                Count: 1,
                ScannedCount: 1
              });
            }
          };
        });
        const mockDAO = new MockDAO();
        const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

        let expectedResult: ITechRecordWrapper = JSON.parse(JSON.stringify(records[10]));
        expectedResult.techRecord.splice(1, 1);
        expectedResult = techRecordsService.formatTechRecordItemForResponse(expectedResult);
        const returnedRecords = await techRecordsService.getTechRecordsList("YV31MEC18GA011933", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
        expect(returnedRecords).toEqual(expectedResult);
      });
    });
  });

  context("when db call returns data and status 'all' is provided", () => {
    it("should return the vehicle with all the technical records", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: [records[8]],
              Count: 1,
              ScannedCount: 1
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      const returnedRecords = await techRecordsService.getTechRecordsList("YV31MEC18GA011900", "all", SEARCHCRITERIA.ALL);
      expect(returnedRecords).not.toEqual(undefined);
      expect(returnedRecords).not.toEqual({});
      expect(returnedRecords.techRecord.length).toEqual(10);
    });
  });

  context("when db returns empty data", () => {
    it("should return 404-No resources match the search criteria", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: {},
              Count: 0,
              ScannedCount: 0
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      try {
        expect(await techRecordsService.getTechRecordsList("Rhubarb", "Potato", SEARCHCRITERIA.ALL)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse.statusCode).toEqual(404);
        expect(errorResponse.body).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
      }
    });
  });
  context("when db return undefined data", () => {
    it("should return 404-No resources match the search criteria if db return null data", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: undefined,
              Count: 0,
              ScannedCount: 0
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      try {
        expect(await techRecordsService.getTechRecordsList("", "", SEARCHCRITERIA.ALL)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(404);
        expect(errorResponse.body).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
      }
    });
  });

  context("when db does not return response", () => {
    it("should return 500-Internal Server Error", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.reject({
              Items: undefined,
              Count: 0,
              ScannedCount: 0
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      try {
        expect(await techRecordsService.getTechRecordsList("", "", SEARCHCRITERIA.ALL)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(500);
        expect(errorResponse.body).toEqual(HTTPRESPONSE.INTERNAL_SERVER_ERROR);
      }
    });
  });

  context("when db returns too many results", () => {
    it("should return 422 - More Than One Match", async () => {

      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: undefined,
              Count: 2,
              ScannedCount: 2
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);
      try {
        expect(await techRecordsService.getTechRecordsList("", "", SEARCHCRITERIA.ALL)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(422);
        expect(errorResponse.body).toEqual(HTTPRESPONSE.MORE_THAN_ONE_MATCH);
      }
    });
  });

  context("when searching for a vehicle with euroStandard field set", () => {

    const MockDAO = jest.fn().mockImplementation((record) => {
      return {
        getBySearchTerm: () => {
          return Promise.resolve({
            Items: [record],
            Count: 1,
            ScannedCount: 1
          });
        }
      };
    });

    it("should return euroStandard as a string, even if the field is set as 0 in dynamodb", async () => {
      const techRecordWithNumber: any = cloneDeep(records[29]);
      techRecordWithNumber.techRecord[0].euroStandard = 0;
      const techRecordsService = new TechRecordsService(new MockDAO(techRecordWithNumber), s3BucketServiceMock);

      const returnedRecords = await techRecordsService.getTechRecordsList("P012301012938", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
      expect(typeof returnedRecords.techRecord[0].euroStandard).toBe("string");
      expect(returnedRecords.techRecord[0].euroStandard).toBe("0");
    });

    it("should return euroStandard as a string when the field is already a string", async () => {
      const techRecordWithString: any = cloneDeep(records[29]);
      techRecordWithString.techRecord[0].euroStandard = "test";
      const techRecordsService = new TechRecordsService(new MockDAO(techRecordWithString), s3BucketServiceMock);

      const returnedRecords = await techRecordsService.getTechRecordsList("P012301012938", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
      expect(typeof returnedRecords.techRecord[0].euroStandard).toBe("string");
      expect(returnedRecords.techRecord[0].euroStandard).toBe("test");
    });

    it("should return euroStandard as null if it has been set as null", async () => {
      const techRecordWithNull: any = cloneDeep(records[29]);
      techRecordWithNull.techRecord[0].euroStandard = null;
      const techRecordsService = new TechRecordsService(new MockDAO(techRecordWithNull), s3BucketServiceMock);

      const returnedRecords = await techRecordsService.getTechRecordsList("P012301012938", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
      expect(returnedRecords.techRecord[0].euroStandard).toBe(null);
    });
  });

});

describe("insertTechRecord", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  context("when inserting a new technical record", () => {
    it("should return 201 Technical Record Created", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createSingle: () => {
            return Promise.resolve({});
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      // @ts-ignore
      const techRecord: ITechRecordWrapper = cloneDeep(records[43]);
      techRecord.vin = Date.now().toString();
      techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
      techRecord.techRecord[0].bodyType.description = "skeletal";
      delete techRecord.techRecord[0].statusCode;
      const msUserDetails = {
        msUser: "dorel",
        msOid: "1234545"
      };

      const data: any = await techRecordsService.insertTechRecord(techRecord, msUserDetails);
      expect(data).not.toEqual(undefined);
      expect(Object.keys(data).length).toEqual(0);
    });
  });

  context("when trying to create a new technical record with invalid payload", () => {
    it("should return validation error 500", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createSingle: () => {
            return Promise.resolve({});
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      // @ts-ignore
      const techRecord: ITechRecordWrapper = cloneDeep(records[29]);
      techRecord.vin = Date.now().toString();
      techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
      techRecord.techRecord[0].bodyType.description = "whatever";
      delete techRecord.techRecord[0].statusCode;
      const msUserDetails = {
        msUser: "dorel",
        msOid: "1234545"
      };

      try {
        expect(await techRecordsService.insertTechRecord(techRecord, msUserDetails)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse.statusCode).toEqual(500);
      }
    });

    it("should return Primary or secondaryVrms are not valid error 500", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createSingle: () => {
            return Promise.resolve({});
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      // @ts-ignore
      const techRecord: ITechRecordWrapper = cloneDeep(records[43]);
      techRecord.vin = Date.now().toString();
      techRecord.primaryVrm = "invalidPrimaryVrm";
      techRecord.secondaryVrms = ["invalidSecondaryVrm"];
      techRecord.techRecord[0].bodyType.description = "skeletal";
      delete techRecord.techRecord[0].statusCode;
      const msUserDetails = {
        msUser: "dorel",
        msOid: "1234545"
      };

      try {
        expect(await techRecordsService.insertTechRecord(techRecord, msUserDetails)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse.statusCode).toEqual(500);
        expect(errorResponse.body).toEqual("Primary or secondaryVrms are not valid");
      }
    });
  });

  context("when trying to create a new technical record with invalid payload", () => {
    it("should return validation error 400", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createSingle: () => {
            return Promise.resolve({});
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      // @ts-ignore
      const techRecord: ITechRecordWrapper = cloneDeep(records[29]);
      techRecord.vin = Date.now().toString();
      techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
      techRecord.techRecord[0].bodyType.description = "whatever";
      delete techRecord.techRecord[0].statusCode;
      const msUserDetails = {
        msUser: "dorel",
        msOid: "1234545"
      };

      try {
        expect(await techRecordsService.insertTechRecord(techRecord, msUserDetails)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse.statusCode).toEqual(400);
      }
    });

    context("and the primaryVRM is missing from the record", () => {
      it("should return Primary or secondaryVrms are not valid error 500", async () => {
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            createSingle: () => {
              return Promise.resolve({});
            }
          };
        });
        const mockDAO = new MockDAO();
        const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[43]);
        techRecord.vin = Date.now().toString();
        techRecord.secondaryVrms = ["invalidSecondaryVrm"];
        techRecord.techRecord[0].bodyType.description = "skeletal";
        delete techRecord.techRecord[0].statusCode;
        delete techRecord.primaryVrm;
        const msUserDetails = {
          msUser: "dorel",
          msOid: "1234545"
        };

        try {
          expect(await techRecordsService.insertTechRecord(techRecord, msUserDetails)).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse.statusCode).toEqual(400);
          expect(errorResponse.body).toEqual("Primary or secondaryVrms are not valid");
        }
      });
    });

    context("and the primaryVrm and secondaryVrms are not valid", () => {
      it("should return Primary or secondaryVrms are not valid error 500", async () => {
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            createSingle: () => {
              return Promise.resolve({});
            }
          };
        });
        const mockDAO = new MockDAO();
        const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[43]);
        techRecord.vin = Date.now().toString();
        techRecord.primaryVrm = "invalidPrimaryVrm";
        techRecord.secondaryVrms = ["invalidSecondaryVrm"];
        techRecord.techRecord[0].bodyType.description = "skeletal";
        delete techRecord.techRecord[0].statusCode;
        const msUserDetails = {
          msUser: "dorel",
          msOid: "1234545"
        };

        try {
          expect(await techRecordsService.insertTechRecord(techRecord, msUserDetails)).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse.statusCode).toEqual(400);
          expect(errorResponse.body).toEqual("Primary or secondaryVrms are not valid");
        }
      });
    });
  });

  context("when trying to create a technical record for existing vehicle", () => {
    it("should return error 400 The conditional request failed", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createSingle: () => {
            return Promise.reject({statusCode: 400, message: "The conditional request failed"});
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      // @ts-ignore
      const techRecord: ITechRecordWrapper = cloneDeep(records[43]);
      delete techRecord.techRecord[0].statusCode;
      try {
        expect(await techRecordsService.insertTechRecord(techRecord, {})).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(400);
        expect(errorResponse.body).toEqual("The conditional request failed");
      }
    });
  });
});

describe("updateTechRecord", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  const msUserDetails = {
    msUser: "dorel",
    msOid: "1234545"
  };
  context("when updating a technical record for an existing vehicle", () => {
    it("should return the updated document", async () => {
      const techRecord: any = cloneDeep(records[44]);
      techRecord.techRecord[0].bodyType.description = "skeletal";
      techRecord.techRecord[0].grossGbWeight = 5555;
      techRecord.techRecord[0].adrDetails.vehicleDetails.type = "Centre axle tank";
      delete techRecord.techRecord[0].statusCode;
      const vrms = [{vrm: "BBBB333", isPrimary: true}, {vrm: "CCCC444", isPrimary: false}];
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          updateSingle: () => {
            return Promise.resolve({
              Attributes: techRecord
            });
          },
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: [cloneDeep(records[44])],
              Count: 1,
              ScannedCount: 1
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);
      const updatedTechRec: any = await techRecordsService.updateTechRecord(techRecord, msUserDetails);
      expect(updatedTechRec).not.toEqual(undefined);
      expect(updatedTechRec).not.toEqual({});
      expect(updatedTechRec).not.toHaveProperty("primaryVrm");
      expect(updatedTechRec).not.toHaveProperty("partialVin");
      expect(updatedTechRec).not.toHaveProperty("secondaryVrms");
      expect(updatedTechRec.vin).toEqual("ABCDEFGH444444");
      expect(updatedTechRec.vrms).toStrictEqual(vrms);
      expect(updatedTechRec.techRecord[0].bodyType.description).toEqual("skeletal");
      expect(updatedTechRec.techRecord[0].grossGbWeight).toEqual(5555);
    });

    it("should get the provisional document to update", async () => {
      const techRecord: any = cloneDeep(records[43]);
      techRecord.techRecord[0].bodyType.description = "skeletal";
      techRecord.techRecord[0].grossGbWeight = 5555;
      techRecord.techRecord[0].adrDetails.vehicleDetails.type = "Artic tractor";
      delete techRecord.techRecord[0].adrDetails.memosApply;
      delete techRecord.techRecord[0].statusCode;
      delete techRecord.techRecord[0].adrDetails.tank;
      const vrms = [{vrm: "LKJH654", isPrimary: true}, {vrm: "POI9876", isPrimary: false}];
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          updateSingle: () => {
            return Promise.resolve({
              Attributes: techRecord
            });
          },
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: [cloneDeep(records[43])],
              Count: 1,
              ScannedCount: 1
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);
      const updatedTechRec: any = await techRecordsService.updateTechRecord(techRecord, msUserDetails);
      expect(updatedTechRec.vin).toEqual("ABCDEFGH654321");
      expect(updatedTechRec.vrms).toStrictEqual(vrms);
      expect(updatedTechRec.techRecord[0].bodyType.description).toEqual("skeletal");
      expect(updatedTechRec.techRecord[0].grossGbWeight).toEqual(5555);
    });

    context("and the payload doesn't pass the validation", () => {
      it("should return error 400 Payload is not valid", async () => {
        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[31]);
        techRecord.techRecord[0].vehicleType = "motorbike";
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            updateSingle: () => {
              return Promise.resolve({
                Attributes: techRecord
              });
            },
            getBySearchTerm: () => {
              return Promise.resolve({
                Items: [cloneDeep(records[31])],
                Count: 1,
                ScannedCount: 1
              });
            }
          };
        });
        const mockDAO = new MockDAO();
        const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);
        const recordToUpdate: any = {
          vin: techRecord.vin,
          partialVin: techRecord.partialVin,
          primaryVrm: techRecord.primaryVrm,
          techRecord:
            [{
              reasonForCreation: techRecord.techRecord[0].reasonForCreation
            }]
        };
        try {
          expect(await techRecordsService.updateTechRecord(recordToUpdate, msUserDetails)).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.statusCode).toEqual(400);
          expect(errorResponse.body).toEqual("\"vehicleType\" must be one of [hgv, psv, trl]");
        }
      });
    });

    context("and the user wants to upload documents", () => {
      it("should return the updated document with the new file appended to the documents array", async () => {
        // @ts-ignore
        const techRecord: any = cloneDeep(records[43]);
        techRecord.techRecord[0].adrDetails.documents = ["1234"];
        delete techRecord.techRecord[0].statusCode;
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            updateSingle: () => {
              return Promise.resolve({
                Attributes: techRecord
              });
            },
            getBySearchTerm: () => {
              return Promise.resolve({
                Items: [cloneDeep(records[43])],
                Count: 1,
                ScannedCount: 1
              });
            }
          };
        });
        const S3Mock = jest.fn().mockImplementation(() => {
          return {
            upload: () => {
              return Promise.resolve({
                Location: `http://localhost:7000/local/someFilename`,
                ETag: "621c9c14d75958d4c3ed8ad77c80cde1",
                Bucket: "local",
                Key: `${process.env.BRANCH}/someFilename`
              });
            }
          };
        });
        const mockDAO = new MockDAO();
        const s3Mock = new S3Mock();
        const techRecordsService = new TechRecordsService(mockDAO, s3Mock);
        const response: any = await techRecordsService.updateTechRecord(techRecord, msUserDetails, ["nsa7zXuM/5iYmrCM2kzmT"]);
        expect(response).toBeDefined();
        expect(response.vin).toEqual("ABCDEFGH654321");
        expect(response.techRecord[response.techRecord.length - 1].adrDetails.documents.indexOf("1234")).not.toEqual(-1);
      });

      it("should get the latest archived record and return the documents array without the branch name", async () => {
        // @ts-ignore
        const techRecord: any = cloneDeep(records[44]);
        const returnedTechRec: any = cloneDeep(records[44]);
        techRecord.techRecord[1].adrDetails.documents = ["CVSB-XYZ/1234"];
        returnedTechRec.techRecord[0].statusCode = "archived";
        returnedTechRec.techRecord[1].statusCode = "archived";
        delete techRecord.techRecord[0].statusCode;
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            updateSingle: () => {
              return Promise.resolve({
                Attributes: techRecord
              });
            },
            getBySearchTerm: () => {
              return Promise.resolve({
                Items: [returnedTechRec],
                Count: 1,
                ScannedCount: 1
              });
            }
          };
        });
        const S3Mock = jest.fn().mockImplementation(() => {
          return {
            upload: () => {
              return Promise.resolve({
                Location: `http://localhost:7000/local/someFilename`,
                ETag: "621c9c14d75958d4c3ed8ad77c80cde1",
                Bucket: "local",
                Key: `${process.env.BRANCH}/someFilename`
              });
            }
          };
        });
        const mockDAO = new MockDAO();
        const s3Mock = new S3Mock();
        const techRecordsService = new TechRecordsService(mockDAO, s3Mock);
        const response: any = await techRecordsService.updateTechRecord(techRecord, msUserDetails, ["nsa7zXuM/5iYmrCM2kzmT"]);
        expect(response).toBeDefined();
        expect(response.vin).toEqual("ABCDEFGH444444");
        expect(response.techRecord[response.techRecord.length - 1].adrDetails.documents.indexOf("1234")).not.toEqual(-1);
      });

      it("should return Error 500 if upload is not successful", async () => {
        const MockDAO = jest.fn().mockImplementation(() => {
          return null;
        });
        const S3Mock = jest.fn().mockImplementation(() => {
          return {
            upload: () => {
              const error: Error = new Error();
              Object.assign(error, {
                message: "The specified bucket does not exist.",
                code: "NoSuchBucket",
                statusCode: 404,
                retryable: false
              });
              return Promise.reject(error);
            }
          };
        });
        const mockDAO = new MockDAO();
        const s3Mock = new S3Mock();
        const techRecordsService = new TechRecordsService(mockDAO, s3Mock);
        const recordToUpdate: any = {vin: "123456656"};
        try {
          expect(await techRecordsService.updateTechRecord(recordToUpdate, msUserDetails, ["nsa7zXuM/5iYmrCM2kzmT"])).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.statusCode).toEqual(404);
          expect(errorResponse.body.message).toEqual("The specified bucket does not exist.");
        }
      });
    });

    context("and the payload contains nulls for all N/A and optional fields for ADR", () => {
      it("should pass the validation and update the record", async () => {
        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[72]);
        techRecord.techRecord[0].reasonForCreation = "Try to update ADR with a lot of null fields";
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            updateSingle: () => {
              return Promise.resolve({
                Attributes: techRecord
              });
            },
            getBySearchTerm: () => {
              return Promise.resolve({
                Items: [cloneDeep(records[72])],
                Count: 1,
                ScannedCount: 1
              });
            }
          };
        });
        const mockDAO = new MockDAO();
        const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);
        const recordToUpdate: any = {
          vin: techRecord.vin,
          techRecord: techRecord.techRecord
        };
        const updatedTechRec: any = await techRecordsService.updateTechRecord(recordToUpdate, msUserDetails);
        expect(updatedTechRec).not.toEqual(undefined);
        expect(updatedTechRec).not.toEqual({});
        expect(updatedTechRec.techRecord[0].reasonForCreation).toEqual("Try to update ADR with a lot of null fields");
      });
    });
  });

  context("when trying to update a technical record for non existing vehicle", () => {
    it("should return error 404 No resources match the search criteria", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          updateSingle: () => {
            return Promise.reject({statusCode: 400, message: "The conditional request failed"});
          },
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: {},
              Count: 0,
              ScannedCount: 0
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      const techRecord: any = cloneDeep(records[43]);
      delete techRecord.techRecord[0].statusCode;
      delete techRecord.techRecord[0].adrDetails;
      techRecord.partialVin = "012345";
      techRecord.vin = "XMGDE02FS0H012345";
      techRecord.primaryVrm = "JY58FPP";
      try {
        expect(await techRecordsService.updateTechRecord(techRecord, msUserDetails)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(404);
        expect(errorResponse.body).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
      }
    });
  });
});

describe("downloadDocument", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  context("when downloading a document that exists in S3", () => {
    it("should return the document", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          downloadFile: () => {
            return Promise.resolve(new HTTPResponse(200, "base64 encoded string"));
          }
        };
      });
      const S3Mock = jest.fn().mockImplementation(() => {
        return {
          download: () => {
            const fileToDownload: Buffer = fs.readFileSync(path.resolve(__dirname, `../resources/signatures/1.base64`));
            const data: S3.Types.GetObjectOutput = {
              Body: fileToDownload,
              ContentLength: fileToDownload.length,
              ETag: "621c9c14d75958d4c3ed8ad77c80cde1",
              LastModified: new Date(),
              Metadata: {}
            };

            const response = new Response<S3.Types.GetObjectOutput, AWSError>();
            Object.assign(response, {data});

            return Promise.resolve({
              $response: response,
              ...data
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const s3Mock = new S3Mock();
      const techRecordsService = new TechRecordsService(mockDAO, s3Mock);
      const document: string = await techRecordsService.downloadFile("1.base64");
      const file: Buffer = fs.readFileSync(path.resolve(__dirname, `../resources/signatures/1.base64`));
      expect(document).toEqual(file.toString("base64"));
    });
  });

  context("when downloading a document that does not exist in S3", () => {
    it("should return error 500 No such Key", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          downloadFile: () => {
            return Promise.resolve(new HTTPResponse(200, "base64 encoded string"));
          }
        };
      });
      const S3Mock = jest.fn().mockImplementation(() => {
        return {
          download: () => {
            const error: Error = new Error();
            Object.assign(error, {
              message: "The specified key does not exist.",
              code: "NoSuchKey",
              statusCode: 404,
              retryable: false
            });
            return Promise.reject(error);
          }
        };
      });
      const mockDAO = new MockDAO();
      const s3Mock = new S3Mock();
      const techRecordsService = new TechRecordsService(mockDAO, s3Mock);
      try {
        expect(await techRecordsService.downloadFile("someKey.pdf")).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(500);
        expect(errorResponse.body).toEqual(HTTPRESPONSE.S3_DOWNLOAD_ERROR);
      }
    });
  });
});



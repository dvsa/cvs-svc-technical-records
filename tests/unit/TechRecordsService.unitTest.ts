/* global describe context it */
import TechRecordsService from "../../src/services/TechRecordsService";
import HTTPError from "../../src/models/HTTPError";
import records from "../resources/technical-records.json";
import {HTTPRESPONSE, STATUS} from "../../src/assets/Enums";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {cloneDeep} from "lodash";

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
      const techRecordsService = new TechRecordsService(mockDAO);


      const returnedRecords: any = await techRecordsService.getTechRecordsList("1B7GG36N12S678410", STATUS.CURRENT);
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
        const techRecordsService = new TechRecordsService(mockDAO);

        let expectedResult: ITechRecordWrapper = JSON.parse(JSON.stringify(records[9]));

        expectedResult.techRecord.splice(0, 1);
        expectedResult = techRecordsService.formatTechRecordItemForResponse(expectedResult);
        const returnedRecords = await techRecordsService.getTechRecordsList("YV31MEC18GA011911", STATUS.PROVISIONAL_OVER_CURRENT);
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
        const techRecordsService = new TechRecordsService(mockDAO);

        let expectedResult: ITechRecordWrapper = JSON.parse(JSON.stringify(records[10]));
        expectedResult.techRecord.splice(1, 1);
        expectedResult = techRecordsService.formatTechRecordItemForResponse(expectedResult);
        const returnedRecords = await techRecordsService.getTechRecordsList("YV31MEC18GA011933", STATUS.PROVISIONAL_OVER_CURRENT);
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
      const techRecordsService = new TechRecordsService(mockDAO);

      const returnedRecords = await techRecordsService.getTechRecordsList("YV31MEC18GA011900", "all");
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
      const techRecordsService = new TechRecordsService(mockDAO);

      try {
        expect(await techRecordsService.getTechRecordsList("Rhubarb", "Potato")).toThrowError();
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
      const techRecordsService = new TechRecordsService(mockDAO);

      try {
        expect(await techRecordsService.getTechRecordsList("", "")).toThrowError();
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
      const techRecordsService = new TechRecordsService(mockDAO);

      try {
        expect(await techRecordsService.getTechRecordsList("", "")).toThrowError();
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
      const techRecordsService = new TechRecordsService(mockDAO);
      try {
        expect(await techRecordsService.getTechRecordsList("", "")).toThrowError();
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
      const techRecordWithNumber = cloneDeep(records[29]);
      const techRecordsService = new TechRecordsService(new MockDAO(techRecordWithNumber));

      const returnedRecords = await techRecordsService.getTechRecordsList("P012301012938", STATUS.PROVISIONAL_OVER_CURRENT);
      expect(typeof returnedRecords.techRecord[0].euroStandard).toBe("string");
      expect(returnedRecords.techRecord[0].euroStandard).toBe("0");
    });

    it("should return euroStandard as a string when the field is already a string", async () => {
      const techRecordWithString: any = cloneDeep(records[29]);
      techRecordWithString.techRecord[0].euroStandard = "test";
      const techRecordsService = new TechRecordsService(new MockDAO(techRecordWithString));

      const returnedRecords = await techRecordsService.getTechRecordsList("P012301012938", STATUS.PROVISIONAL_OVER_CURRENT);
      expect(typeof returnedRecords.techRecord[0].euroStandard).toBe("string");
      expect(returnedRecords.techRecord[0].euroStandard).toBe("test");
    });

    it("should return euroStandard as null if it has been set as null", async () => {
      const techRecordWithNull: any = cloneDeep(records[29]);
      techRecordWithNull.techRecord[0].euroStandard = null;
      const techRecordsService = new TechRecordsService(new MockDAO(techRecordWithNull));

      const returnedRecords = await techRecordsService.getTechRecordsList("P012301012938", STATUS.PROVISIONAL_OVER_CURRENT);
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
      const techRecordsService = new TechRecordsService(mockDAO);

      // @ts-ignore
      const techRecord: ITechRecordWrapper = cloneDeep(records[0]);
      techRecord.vin = Date.now().toString();
      techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
      techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
      techRecord.techRecord[0].bodyType.description = "new tech record";

      const data: any = await techRecordsService.insertTechRecord(techRecord);
      expect(data).not.toEqual(undefined);
      expect(Object.keys(data).length).toEqual(0);
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
      const techRecordsService = new TechRecordsService(mockDAO);

      // @ts-ignore
      const techRecord: ITechRecordWrapper = cloneDeep(records[0]);
      techRecord.partialVin = "012345";
      techRecord.vin = "XMGDE02FS0H012345";
      techRecord.primaryVrm = "JY58FPP";

      try {
        expect(await techRecordsService.insertTechRecord(techRecord)).toThrowError();
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
      // @ts-ignore
      const techRecord: ITechRecordWrapper = cloneDeep(records[31]);
      techRecord.techRecord[0].bodyType.description = "new tech record";
      techRecord.techRecord[0].grossGbWeight = 5555;
      const vrms = [{vrm: "YYY3456", isPrimary: true}];
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
      const techRecordsService = new TechRecordsService(mockDAO);
      const recordToUpdate: any = {
        vin: techRecord.vin,
        partialVin: techRecord.partialVin,
        primaryVrm: techRecord.primaryVrm,
        techRecord:
          [{
            reasonForCreation: techRecord.techRecord[0].reasonForCreation,
            adrDetails: techRecord.techRecord[0].adrDetails
          }]
      };
      const updatedTechRec: any = await techRecordsService.updateTechRecord(recordToUpdate, msUserDetails);
      expect(updatedTechRec).not.toEqual(undefined);
      expect(updatedTechRec).not.toEqual({});
      expect(updatedTechRec).not.toHaveProperty("primaryVrm");
      expect(updatedTechRec).not.toHaveProperty("partialVin");
      expect(updatedTechRec).not.toHaveProperty("secondaryVrms");
      expect(updatedTechRec.vin).toEqual("P1234567890123");
      expect(updatedTechRec.vrms).toStrictEqual(vrms);
      expect(updatedTechRec.techRecord[0].bodyType.description).toEqual("new tech record");
      expect(updatedTechRec.techRecord[0].grossGbWeight).toEqual(5555);
    });

    context("and the payload doesn't pass the validation", () => {
      it("should return the updated document", async () => {
        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[31]);
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
        const techRecordsService = new TechRecordsService(mockDAO);
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
          expect(errorResponse.statusCode).toEqual(500);
          expect(errorResponse.body[0].message).toEqual('"adrDetails" is required');
        }
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
      const techRecordsService = new TechRecordsService(mockDAO);

      // @ts-ignore
      const techRecord: ITechRecordWrapper = cloneDeep(records[0]);
      techRecord.partialVin = "012345";
      techRecord.vin = "XMGDE02FS0H012345";
      techRecord.primaryVrm = "JY58FPP";
      techRecord.techRecord[0].bodyType.description = "new tech record";
      techRecord.techRecord[0].grossGbWeight = 5555;

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


/* global describe context it */
import TechRecordsService from "../../src/services/TechRecordsService";
import HTTPError from "../../src/models/HTTPError";
import records from "../resources/technical-records.json";
import {HTTPRESPONSE, SEARCHCRITERIA, STATUS, EU_VEHICLE_CATEGORY, ERRORS} from "../../src/assets/Enums";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {cloneDeep} from "lodash";
import HTTPResponse from "../../src/models/HTTPResponse";
import Configuration from "../../src/utils/Configuration";

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


      const returnedRecords: any = await techRecordsService.getTechRecordsList("1B7GG36N12S678410", STATUS.CURRENT, SEARCHCRITERIA.ALL);
      expect(returnedRecords).not.toEqual(undefined);
      expect(returnedRecords).not.toEqual({});
      expect(returnedRecords).toEqual(Array.of(techRecord));
    });
  });

  context("and the statusCode by which we query is provisional_over_current", () => {
    context("and the result is a techRecord with one provisional entry and one current one", () => {
      it("should return an array containing the provisional entry", async () => {
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
        const returnedRecords = await techRecordsService.getTechRecordsList("YV31MEC18GA011911", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
        expect(returnedRecords).toEqual(Array.of(expectedResult));
      });
    });

    context("and the result is a techRecord with one archived entry and one current one", () => {
      it("should return an array containing the current entry", async () => {
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
        const returnedRecords = await techRecordsService.getTechRecordsList("YV31MEC18GA011933", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
        expect(returnedRecords).toEqual(Array.of(expectedResult));
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

      const returnedRecords = await techRecordsService.getTechRecordsList("YV31MEC18GA011900", "all", SEARCHCRITERIA.ALL);
      expect(returnedRecords[0]).not.toEqual(undefined);
      expect(returnedRecords[0]).not.toEqual({});
      expect(returnedRecords[0].techRecord.length).toEqual(10);
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
      const techRecordsService = new TechRecordsService(mockDAO);

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
      const techRecordsService = new TechRecordsService(mockDAO);

      try {
        expect(await techRecordsService.getTechRecordsList("", "", SEARCHCRITERIA.ALL)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(500);
        expect(errorResponse.body).toEqual(HTTPRESPONSE.INTERNAL_SERVER_ERROR);
      }
    });
  });

  context("when db returns more than 1 result", () => {
    it("should return all in an array", async () => {
      const retVals = [
        {techRecord: [{statusCode: "Banana"}]},
        {techRecord: [{statusCode: "Cucumber"}]}
      ];
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: retVals,
              Count: 2,
              ScannedCount: 2
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);
      expect.assertions(1);
      const retVal = await techRecordsService.getTechRecordsList("", "all", SEARCHCRITERIA.ALL);
      expect(retVal).toEqual(retVals);
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
      const techRecordsService = new TechRecordsService(new MockDAO(techRecordWithNumber));

      const returnedRecords = await techRecordsService.getTechRecordsList("P012301012938", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
      expect(typeof returnedRecords[0].techRecord[0].euroStandard).toBe("string");
      expect(returnedRecords[0].techRecord[0].euroStandard).toBe("0");
    });

    it("should return euroStandard as a string when the field is already a string", async () => {
      const techRecordWithString: any = cloneDeep(records[29]);
      techRecordWithString.techRecord[0].euroStandard = "test";
      const techRecordsService = new TechRecordsService(new MockDAO(techRecordWithString));

      const returnedRecords = await techRecordsService.getTechRecordsList("P012301012938", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
      expect(typeof returnedRecords[0].techRecord[0].euroStandard).toBe("string");
      expect(returnedRecords[0].techRecord[0].euroStandard).toBe("test");
    });

    it("should return euroStandard as null if it has been set as null", async () => {
      const techRecordWithNull: any = cloneDeep(records[29]);
      techRecordWithNull.techRecord[0].euroStandard = null;
      const techRecordsService = new TechRecordsService(new MockDAO(techRecordWithNull));

      const returnedRecords = await techRecordsService.getTechRecordsList("P012301012938", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
      expect(returnedRecords[0].techRecord[0].euroStandard).toBe(null);
    });
  });

});

describe("insertTechRecord", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  beforeAll(() => {
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(false);
  });
  afterAll(() => {
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(true);
  });
  context("when inserting a new technical record", () => {
    it("should return 201 Technical Record Created", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createSingle: () => {
            return Promise.resolve({});
          },
          getSystemNumber: () => Promise.resolve({systemNumber: "10000001", testNumberKey: 3}),
          getTrailerId: () => {
            return Promise.resolve({
              trailerId: "C530001",
              trailerLetter: "C",
              sequenceNumber: 530001,
              testNumberKey: 2
            });
          }
        };
      });
      const techRecordsService = new TechRecordsService(new MockDAO());

      // @ts-ignore
      const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
      delete techRecord.techRecord[0].statusCode;
      delete techRecord.systemNumber;
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
    it("should return validation error 400", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createSingle: () => {
            return Promise.resolve({});
          },
          getSystemNumber: () => Promise.resolve({systemNumber: "10000001", testNumberKey: 3})
        };
      });
      const techRecordsService = new TechRecordsService(new MockDAO());

      // @ts-ignore
      const techRecord: ITechRecordWrapper = cloneDeep(records[29]);
      techRecord.techRecord[0].bodyType.description = "whatever";
      delete techRecord.techRecord[0].statusCode;
      delete techRecord.systemNumber;
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
      it("should return Primary or secondaryVrms are not valid error 400", async () => {
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            createSingle: () => {
              return Promise.resolve({});
            },
            getSystemNumber: () => Promise.resolve({systemNumber: "10000001", testNumberKey: 3})
          };
        });
        const techRecordsService = new TechRecordsService(new MockDAO());

        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[43]);
        techRecord.secondaryVrms = ["invalidSecondaryVrm"];
        techRecord.techRecord[0].bodyType.description = "skeletal";
        delete techRecord.techRecord[0].statusCode;
        delete techRecord.primaryVrm;
        delete techRecord.systemNumber;
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
      it("should return Primary or secondaryVrms are not valid error 400", async () => {
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            createSingle: () => {
              return Promise.resolve({});
            },
            getSystemNumber: () => Promise.resolve({systemNumber: "10000001", testNumberKey: 3})
          };
        });
        const techRecordsService = new TechRecordsService(new MockDAO());

        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[43]);
        techRecord.primaryVrm = "invalidPrimaryVrm";
        techRecord.secondaryVrms = ["invalidSecondaryVrm"];
        techRecord.techRecord[0].bodyType.description = "skeletal";
        delete techRecord.techRecord[0].statusCode;
        delete techRecord.systemNumber;
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
          },
          getSystemNumber: () => Promise.resolve({systemNumber: "10000001", testNumberKey: 3})
        };
      });
      const techRecordsService = new TechRecordsService(new MockDAO());

      // @ts-ignore
      const techRecord: ITechRecordWrapper = cloneDeep(records[43]);
      delete techRecord.techRecord[0].statusCode;
      delete techRecord.systemNumber;
      try {
        expect(await techRecordsService.insertTechRecord(techRecord, {})).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(400);
        expect(errorResponse.body).toEqual("The conditional request failed");
      }
    });
  });

  context("when trying to create a new trailer", () => {
    context("and the trailer id generation is successfull", () => {
      it("should set the correct trailerId on the vehicle", async () => {
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getTrailerId: () => {
              return Promise.resolve({
                trailerId: "C530001",
                trailerLetter: "C",
                sequenceNumber: 530001,
                testNumberKey: 2
              });
            }
          };
        });
        const techRecordsService = new TechRecordsService(new MockDAO());

        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
        delete techRecord.trailerId;
        delete techRecord.techRecord[0].statusCode;

        expect(await techRecordsService.setTrailerId()).toEqual("C530001");
      });
    });
    context("and the trailer id generation failed", () => {
      context("and the trailer id object doesn't contain the trailerId attribute", () => {
        it("should return error 500 TrailerId generation failed", async () => {
          const MockDAO = jest.fn().mockImplementation(() => {
            return {
              getTrailerId: () => {
                return Promise.resolve({
                  trailerLetter: "C",
                  sequenceNumber: 530001,
                  testNumberKey: 2
                });
              }
            };
          });
          const techRecordsService = new TechRecordsService(new MockDAO());

          // @ts-ignore
          const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
          delete techRecord.trailerId;
          delete techRecord.techRecord[0].statusCode;

          try {
            expect(await techRecordsService.setTrailerId()).toThrowError();
          } catch (errorResponse) {
            expect(errorResponse.statusCode).toEqual(500);
            expect(errorResponse.body).toEqual(ERRORS.TRAILER_ID_GENERATION_FAILED);
          }
        });
      });

      context("and the trailer id object contains the error attribute", () => {
        it("should return error 500 TrailerId generation failed", async () => {
          const MockDAO = jest.fn().mockImplementation(() => {
            return {
              getTrailerId: () => {
                return Promise.resolve({
                  error: "Some error from test-number microservice"
                });
              }
            };
          });
          const techRecordsService = new TechRecordsService(new MockDAO());

          // @ts-ignore
          const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
          delete techRecord.trailerId;
          delete techRecord.techRecord[0].statusCode;

          try {
            expect(await techRecordsService.setTrailerId()).toThrowError();
          } catch (errorResponse) {
            expect(errorResponse.statusCode).toEqual(500);
            expect(errorResponse.body).toEqual("Some error from test-number microservice");
          }
        });
      });

      context("and the test-number microservice returned an error", () => {
        it("should return error 500", async () => {
          const MockDAO = jest.fn().mockImplementation(() => {
            return {
              getTrailerId: () => {
                return Promise.reject("Error from test-number microservice");
              }
            };
          });
          const techRecordsService = new TechRecordsService(new MockDAO());

          // @ts-ignore
          const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
          delete techRecord.trailerId;
          delete techRecord.techRecord[0].statusCode;

          try {
            expect(await techRecordsService.setTrailerId()).toThrowError();
          } catch (errorResponse) {
            expect(errorResponse.statusCode).toEqual(500);
            expect(errorResponse.body).toEqual("Error from test-number microservice");
          }
        });
      });
    });
  });

  context("when trying to create a new vehicle", () => {
    context("and the system number generation is successfull", () => {
      it("should set the correct system number on the vehicle", async () => {
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getSystemNumber: () => {
              return Promise.resolve({
                systemNumber: "10001111",
                testNumberKey: 3
              });
            }
          };
        });
        const mockDAO = new MockDAO();
        const techRecordsService = new TechRecordsService(mockDAO);

        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
        techRecord.vin = Date.now().toString();
        delete techRecord.trailerId;
        delete techRecord.techRecord[0].statusCode;

        expect(await techRecordsService.generateSystemNumber()).toEqual("10001111");
      });
    });
    context("and the system number generation failed", () => {
      context("and the system number object doesn't contain the systemNumber attribute", () => {
        it("should return error 500 System Number generation failed", async () => {
          const MockDAO = jest.fn().mockImplementation(() => {
            return {
              getSystemNumber: () => {
                return Promise.resolve({
                  testNumberKey: 3
                });
              }
            };
          });
          const mockDAO = new MockDAO();
          const techRecordsService = new TechRecordsService(mockDAO);

          // @ts-ignore
          const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
          techRecord.vin = Date.now().toString();
          delete techRecord.trailerId;
          delete techRecord.techRecord[0].statusCode;

          try {
            expect(await techRecordsService.generateSystemNumber()).toThrowError();
          } catch (errorResponse) {
            expect(errorResponse.statusCode).toEqual(500);
            expect(errorResponse.body).toEqual(ERRORS.SYSTEM_NUMBER_GENERATION_FAILED);
          }
        });
      });

      context("and the system number object contains the error attribute", () => {
        it("should return error 500 System Number generation failed", async () => {
          const MockDAO = jest.fn().mockImplementation(() => {
            return {
              getSystemNumber: () => {
                return Promise.resolve({
                  error: "Some error from test-number microservice"
                });
              }
            };
          });
          const mockDAO = new MockDAO();
          const techRecordsService = new TechRecordsService(mockDAO);

          // @ts-ignore
          const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
          techRecord.vin = Date.now().toString();
          delete techRecord.trailerId;
          delete techRecord.techRecord[0].statusCode;

          try {
            expect(await techRecordsService.generateSystemNumber()).toThrowError();
          } catch (errorResponse) {
            expect(errorResponse.statusCode).toEqual(500);
            expect(errorResponse.body).toEqual("Some error from test-number microservice");
          }
        });
      });

      context("and the test-number microservice returned an error", () => {
        it("should return error 500", async () => {
          const MockDAO = jest.fn().mockImplementation(() => {
            return {
              getSystemNumber: () => {
                return Promise.reject("Error from test-number microservice");
              }
            };
          });
          const mockDAO = new MockDAO();
          const techRecordsService = new TechRecordsService(mockDAO);

          // @ts-ignore
          const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
          techRecord.vin = Date.now().toString();
          delete techRecord.trailerId;
          delete techRecord.techRecord[0].statusCode;

          try {
            expect(await techRecordsService.generateSystemNumber()).toThrowError();
          } catch (errorResponse) {
            expect(errorResponse.statusCode).toEqual(500);
            expect(errorResponse.body).toEqual("Error from test-number microservice");
          }
        });
      });
    });
  });
});

describe("updateTechRecord", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  beforeAll(() => {
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(false);
  });
  afterAll(() => {
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(true);
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
      const techRecordsService = new TechRecordsService(new MockDAO());
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
      const techRecordsService = new TechRecordsService(new MockDAO());
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
        const techRecordsService = new TechRecordsService(new MockDAO());
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
          expect(errorResponse.body.errors).toContain("\"vehicleType\" must be one of [hgv, psv, trl]");
        }
      });
    });

    context("and the user wants to update an archived record", () => {
      it("should return error 400 Cannot update an archived record", async () => {
        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[31]);
        const MockDAO = jest.fn().mockImplementation();
        const techRecordsService = new TechRecordsService(new MockDAO());
        try {
          expect(await techRecordsService.updateTechRecord(techRecord, msUserDetails)).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.statusCode).toEqual(400);
          expect(errorResponse.body).toEqual(ERRORS.CANNOT_UPDATE_ARCHIVED_RECORD);
        }
      });
    });

    context("and the user wants to update a record which doesn't have the specified statusCode", () => {
      it("should return error 500 Vehicle has no tech-records with status {statusCode}", async () => {
        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[43]);
        const MockDAO = jest.fn().mockImplementation();
        const techRecordsService = new TechRecordsService(new MockDAO());
        try {
          expect(await techRecordsService.getTechRecordToArchive(techRecord, STATUS.CURRENT)).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.statusCode).toEqual(404);
          expect(errorResponse.body).toEqual("Vehicle has no tech-records with status current");
        }
      });
    });

    context("and the user wants to update a record which doesn't have the specified statusCode", () => {
      it("should return error 500 Vehicle has no tech-records with status {statusCode}", async () => {
        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[43]);
        const MockDAO = jest.fn().mockImplementation();
        const techRecordsService = new TechRecordsService(new MockDAO());
        const recordToUpdate: any = {
          techRecord: [techRecord.techRecord[0], techRecord.techRecord[0]]
        };
        try {
          expect(await techRecordsService.getTechRecordToArchive(recordToUpdate, STATUS.PROVISIONAL)).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.statusCode).toEqual(500);
          expect(errorResponse.body).toEqual("Vehicle has more than one tech-record with status provisional");
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
      const techRecordsService = new TechRecordsService(new MockDAO());

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
describe("updateEuVehicleCategory", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  const msUserDetails = {
    msUser: "dorel",
    msOid: "1234545"
  };
  context("when updating a euVehicleCategory for an existing vehicle where the value is null", () => {
    it("should update the euVehicleCategory with the value provided", async () => {
      const expectedTechRecord = cloneDeep<ITechRecordWrapper>(records[22]);
      const systemNumber = "10000023";
      const newEuVehicleCategory = "m1";
      expectedTechRecord.techRecord[0].euVehicleCategory = newEuVehicleCategory;
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          updateSingle: () => {
            return Promise.resolve({
              Attributes: expectedTechRecord
            });
          },
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: [cloneDeep(records[22])],
              Count: 1,
              ScannedCount: 1
            });
          }
        };
      });
      expect.assertions(2);
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);
      const response: HTTPResponse | HTTPError = await techRecordsService.updateEuVehicleCategory(systemNumber, EU_VEHICLE_CATEGORY.M1);
      const updatedTechRec: ITechRecordWrapper = JSON.parse(response.body);
      expect(response.statusCode).toEqual(200);
      expect(updatedTechRec.techRecord[0].euVehicleCategory).toEqual(newEuVehicleCategory);
    });
  });

  context("when updating a euVehicleCategory for an existing vehicle where the value is not null", () => {
    it("should update the euVehicleCategory with the value provided", async () => {
      const systemNumber = "10000001";
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: [cloneDeep(records[0])],
              Count: 1,
              ScannedCount: 1
            });
          }
        };
      });
      expect.assertions(2);
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);
      const response: HTTPResponse | HTTPError = await techRecordsService.updateEuVehicleCategory(systemNumber, EU_VEHICLE_CATEGORY.M1);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(`"${HTTPRESPONSE.NO_EU_VEHICLE_CATEGORY_UPDATE_REQUIRED}"`);
    });
  });
});

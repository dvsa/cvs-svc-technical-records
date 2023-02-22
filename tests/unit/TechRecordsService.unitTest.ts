/* global describe context it */
import TechRecordsService from "../../src/services/TechRecordsService";
import HTTPError from "../../src/models/HTTPError";
import records from "../resources/technical-records.json";
import {ERRORS, EU_VEHICLE_CATEGORY, HTTPRESPONSE, SEARCHCRITERIA, STATUS, UPDATE_TYPE} from "../../src/assets/Enums";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {cloneDeep} from "lodash";
import HTTPResponse from "../../src/models/HTTPResponse";
import Configuration from "../../src/utils/Configuration";
import IMsUserDetails from "../../@Types/IUserDetails";
import {HeavyGoodsVehicle, PublicServiceVehicle, Trailer} from "../../@Types/TechRecords";
import {NumberGenerator} from "../../src/handlers/NumberGenerator";
import {TechRecordsListHandler} from "../../src/handlers/TechRecordsListHandler";
import {TechRecordStatusHandler} from "../../src/handlers/TechRecordStatusHandler";

const msUserDetails: IMsUserDetails = {
  msUser: "dorel",
  msOid: "1234545"
};

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
            return Promise.resolve([techRecord]);
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
              return Promise.resolve(cloneDeep([records[9]]));
            }
          };
        });
        const mockDAO = new MockDAO();
        const techRecordsService = new TechRecordsService(mockDAO);
        const techRecordsListHandler = new TechRecordsListHandler<PublicServiceVehicle>(mockDAO);

        let expectedResult: PublicServiceVehicle = JSON.parse(JSON.stringify(records[9]));

        expectedResult.techRecord.splice(0, 1);
        expectedResult = techRecordsListHandler.formatTechRecordItemForResponse(expectedResult);
        const returnedRecords = await techRecordsService.getTechRecordsList("YV31MEC18GA011911", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
        expect(returnedRecords).toEqual(Array.of(expectedResult));
      });
    });

    context("and the result is a techRecord with one archived entry and one current one", () => {
      it("should return an array containing the current entry", async () => {
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getBySearchTerm: () => {
              return Promise.resolve(cloneDeep([records[10]]));
            }
          };
        });
        const mockDAO = new MockDAO();
        const techRecordsService = new TechRecordsService(mockDAO);
        const techRecordsListHandler = new TechRecordsListHandler<PublicServiceVehicle>(mockDAO);

        let expectedResult: PublicServiceVehicle = JSON.parse(JSON.stringify(records[10]));
        expectedResult.techRecord.splice(1, 1);
        expectedResult = techRecordsListHandler.formatTechRecordItemForResponse(expectedResult);
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
            return Promise.resolve(cloneDeep([records[8]]));
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
            return Promise.resolve([]);
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      try {
        expect(await techRecordsService.getTechRecordsList("Rhubarb", "Potato", SEARCHCRITERIA.ALL)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse.statusCode).toEqual(404);
        // FIXME: array to string
        expect(errorResponse.body.errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
      }
    });
  });
  context("when db return undefined data", () => {
    it("should return 404-No resources match the search criteria if db return null data", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve([]);
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
        // FIXME: array to string
        expect(errorResponse.body.errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
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
        // FIXME: array to string
        expect(errorResponse.body.errors).toContain(HTTPRESPONSE.INTERNAL_SERVER_ERROR);
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
            return Promise.resolve(retVals);
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
          return Promise.resolve([record]);
        }
      };
    });

    it("should return euroStandard as a string, even if the field is set as 0 in dynamodb", async () => {
      const techRecordWithNumber: any = cloneDeep(records[29]);
      techRecordWithNumber.techRecord[0].euroStandard = 0;
      const techRecordsService = new TechRecordsService(new MockDAO(techRecordWithNumber));

      const returnedRecords: any = await techRecordsService.getTechRecordsList("P012301012938", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
      expect(typeof returnedRecords[0].techRecord[0].euroStandard).toBe("string");
      expect(returnedRecords[0].techRecord[0].euroStandard).toBe("0");
    });

    it("should return euroStandard as a string when the field is already a string", async () => {
      const techRecordWithString: any = cloneDeep(records[29]);
      techRecordWithString.techRecord[0].euroStandard = "test";
      const techRecordsService = new TechRecordsService(new MockDAO(techRecordWithString));

      const returnedRecords: any = await techRecordsService.getTechRecordsList("P012301012938", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
      expect(typeof returnedRecords[0].techRecord[0].euroStandard).toBe("string");
      expect(returnedRecords[0].techRecord[0].euroStandard).toBe("test");
    });

    it("should return euroStandard as null if it has been set as null", async () => {
      const techRecordWithNull: any = cloneDeep(records[29]);
      techRecordWithNull.techRecord[0].euroStandard = null;
      const techRecordsService = new TechRecordsService(new MockDAO(techRecordWithNull));

      const returnedRecords: any = await techRecordsService.getTechRecordsList("P012301012938", STATUS.PROVISIONAL_OVER_CURRENT, SEARCHCRITERIA.ALL);
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
      // @ts-ignore
      const techRecord: Trailer = cloneDeep(records[78]);
      delete techRecord.techRecord[0].statusCode;
      delete techRecord.systemNumber;

      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createSingle: () => {
            return Promise.resolve({
              Attributes: techRecord
            });
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

      const data: any = await techRecordsService.insertTechRecord(techRecord, msUserDetails);

      expect(data).not.toEqual(undefined);
      expect(Object.keys(data).length).toEqual(7);
    });

    context("and the primaryVRM is missing from the record", () => {
      it("should generate a z number and create the record", async () => {
        // @ts-ignore
        const techRecord: HeavyGoodsVehicle = cloneDeep(records[43]);
        // techRecord.secondaryVrms = ["invalidSecondaryVrm"];
        techRecord.techRecord[0].bodyType.description = "skeletal";
        delete techRecord.techRecord[0].statusCode;
        delete techRecord.primaryVrm;
        delete techRecord.systemNumber;

        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            createSingle: () => {
              return Promise.resolve({
                Attributes: techRecord
              });
            },
            getSystemNumber: () => Promise.resolve({systemNumber: "10000001", testNumberKey: 3}),
            getZNumber: () => Promise.resolve({zNumber: "1000001Z"}),
          };
        });
        const techRecordsService = new TechRecordsService(new MockDAO());

        const data = await techRecordsService.insertTechRecord(techRecord, msUserDetails);
        expect(data.primaryVrm).toBe("1000001Z");
      });
    });
  });

  context("when trying to create a new technical record with invalid payload", () => {
    it("should return validation error 400", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createSingle: () => {
            return Promise.resolve({});
          },
          getSystemNumber: () => Promise.resolve({systemNumber: "10000001", testNumberKey: 3}),
          getTrailerId: () => Promise.resolve({trailerId: "C320001", testNumberKey: 2})
        };
      });
      const techRecordsService = new TechRecordsService(new MockDAO());

      // @ts-ignore
      const techRecord: Trailer = cloneDeep(records[29]);
      techRecord.techRecord[0].bodyType.description = "whatever";
      delete techRecord.techRecord[0].statusCode;
      delete techRecord.systemNumber;

      try {
        expect(await techRecordsService.insertTechRecord(techRecord, msUserDetails)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse.statusCode).toEqual(400);
      }
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
        const techRecord: HeavyGoodsVehicle = cloneDeep(records[43]);
        techRecord.primaryVrm = "invalidPrimaryVrm";
        techRecord.secondaryVrms = ["invalidSecondaryVrm"];
        techRecord.techRecord[0].bodyType.description = "skeletal";
        delete techRecord.techRecord[0].statusCode;
        delete techRecord.systemNumber;

        try {
          expect(await techRecordsService.insertTechRecord(techRecord, msUserDetails)).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse.statusCode).toEqual(400);
          expect(errorResponse.body.errors).toContain(ERRORS.INVALID_PRIMARY_VRM);
          expect(errorResponse.body.errors).toContain(ERRORS.INVALID_SECONDARY_VRM);
        }
      });
    });
  });
// FIXME: Review the use of existing implementation of string error vs error array
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
      const techRecord: HeavyGoodsVehicle = cloneDeep(records[43]);
      delete techRecord.techRecord[0].statusCode;
      delete techRecord.systemNumber;
      try {
        expect(await techRecordsService.insertTechRecord(techRecord, msUserDetails)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(400);
        // expect(errorResponse.body).toEqual("The conditional request failed");wq
        expect(errorResponse.body.errors).toContain("The conditional request failed");
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
        const numberGenerator = new NumberGenerator(new MockDAO());

        // @ts-ignore
        const techRecord: Trailer = cloneDeep(records[78]);
        delete techRecord.trailerId;
        delete techRecord.techRecord[0].statusCode;

        expect(await numberGenerator.generateTrailerId()).toEqual("C530001");
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
          const numberGenerator = new NumberGenerator(new MockDAO());

          // @ts-ignore
          const techRecord: Trailer = cloneDeep(records[78]);
          delete techRecord.trailerId;
          delete techRecord.techRecord[0].statusCode;

          try {
            expect(await numberGenerator.generateTrailerId()).toThrowError();
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
          const numberGenerator = new NumberGenerator(new MockDAO());

          // @ts-ignore
          const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
          delete techRecord.trailerId;
          delete techRecord.techRecord[0].statusCode;

          try {
            expect(await numberGenerator.generateTrailerId()).toThrowError();
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
          const numberGenerator = new NumberGenerator(new MockDAO());

          // @ts-ignore
          const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
          delete techRecord.trailerId;
          delete techRecord.techRecord[0].statusCode;

          try {
            expect(await numberGenerator.generateTrailerId()).toThrowError();
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
        const numberGenerator = new NumberGenerator(new MockDAO());

        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
        techRecord.vin = Date.now().toString();
        delete techRecord.trailerId;
        delete techRecord.techRecord[0].statusCode;

        expect(await numberGenerator.generateSystemNumber()).toEqual("10001111");
      });
    });
    context("and there is no vrm on the vehicle", () => {
      it("should generate the correct ZNumber", async () => {
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getZNumber: () => {
              return Promise.resolve({
                zNumber: "10001111",
                testNumberKey: 4
              });
            }
          };
        });
        const numberGenerator = new NumberGenerator(new MockDAO());
        expect(await numberGenerator.generateZNumber()).toEqual("10001111");
      });
      it("should return error 500 Z Number generation failed", async () => {
          const MockDAO = jest.fn().mockImplementation(() => {
            return {
              getZNumber: () => {
                return Promise.resolve({
                  testNumberKey: 5
                });
              }
            };
          });
          const numberGenerator = new NumberGenerator(new MockDAO());

          try {
            expect(await numberGenerator.generateZNumber()).toThrowError();
          } catch (errorResponse) {
            expect(errorResponse.statusCode).toEqual(500);
            expect(errorResponse.body).toEqual(ERRORS.Z_NUMBER_GENERATION_FAILED);
          }
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
          const numberGenerator = new NumberGenerator(new MockDAO());

          // @ts-ignore
          const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
          techRecord.vin = Date.now().toString();
          delete techRecord.trailerId;
          delete techRecord.techRecord[0].statusCode;

          try {
            expect(await numberGenerator.generateSystemNumber()).toThrowError();
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
          const numberGenerator = new NumberGenerator(new MockDAO());

          // @ts-ignore
          const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
          techRecord.vin = Date.now().toString();
          delete techRecord.trailerId;
          delete techRecord.techRecord[0].statusCode;

          try {
            expect(await numberGenerator.generateSystemNumber()).toThrowError();
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
          const numberGenerator = new NumberGenerator(new MockDAO());

          // @ts-ignore
          const techRecord: ITechRecordWrapper = cloneDeep(records[78]);
          techRecord.vin = Date.now().toString();
          delete techRecord.trailerId;
          delete techRecord.techRecord[0].statusCode;

          try {
            expect(await numberGenerator.generateSystemNumber()).toThrowError();
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
            return Promise.resolve(cloneDeep([records[44]]));
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
            return Promise.resolve(cloneDeep([records[43]]));
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
              return Promise.resolve(cloneDeep([records[31]]));
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
          expect(errorResponse.body.errors).toContain(ERRORS.VEHICLE_TYPE_ERROR);
        }
      });
    });

    context("and the user wants to update an archived record", () => {
      it("should return error 400 Cannot update an archived record", async () => {
        // @ts-ignore
        const techRecord: Trailer = cloneDeep(records[31]);
        const MockDAO = jest.fn().mockImplementation();
        const techRecordsService = new TechRecordsService(new MockDAO());
        try {
          expect(await techRecordsService.updateTechRecord(techRecord, msUserDetails)).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.statusCode).toEqual(400);
          expect(errorResponse.body.errors).toContain(ERRORS.CANNOT_USE_UPDATE_TO_ARCHIVE);
        }
      });
    });

    context("and the user wants to use the update API to archive a record", () => {
      it("should return error 400 Cannot use update API to archive tech record", async () => {
        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[43]);
        techRecord.techRecord[0].statusCode = STATUS.ARCHIVED;
        const MockDAO = jest.fn().mockImplementation();
        const techRecordsService = new TechRecordsService(new MockDAO());
        const recordToUpdate: any = {
          techRecord: [techRecord.techRecord[0]]
        };
        try {
          expect(await techRecordsService.updateTechRecord(recordToUpdate, msUserDetails, STATUS.ARCHIVED)).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.statusCode).toEqual(400);
          expect(errorResponse.body.errors).toContain(ERRORS.CANNOT_USE_UPDATE_TO_ARCHIVE);
        }
      });
    });

    context("and the user wants to change a record from current to provisional", () => {
      it("should return error 400 Cannot change current status to provisional", async () => {
        // @ts-ignore
        const techRecord: ITechRecordWrapper = cloneDeep(records[43]);
        techRecord.techRecord[0].statusCode = STATUS.PROVISIONAL;
        const MockDAO = jest.fn().mockImplementation();
        const techRecordsService = new TechRecordsService(new MockDAO());
        const recordToUpdate: any = {
          techRecord: [techRecord.techRecord[0]]
        };
        try {
          expect(await techRecordsService.updateTechRecord(recordToUpdate, msUserDetails, STATUS.CURRENT)).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.statusCode).toEqual(400);
          expect(errorResponse.body.errors).toContain(ERRORS.CANNOT_CHANGE_CURRENT_TO_PROVISIONAL);
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
            return Promise.resolve([]);
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
        // FIXME: discuss on how to string vs array of strings
        expect(errorResponse.body.errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
      }
    });
  });
});

describe("updateEuVehicleCategory", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

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
            return Promise.resolve(cloneDeep([records[22]]));
          }
        };
      });
      expect.assertions(2);
      const {msUser, msOid } = msUserDetails;
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);
      const response: HTTPResponse | HTTPError = await techRecordsService.updateEuVehicleCategory(systemNumber, EU_VEHICLE_CATEGORY.M1, msOid, msUser);
      const updatedTechRec: ITechRecordWrapper = JSON.parse(response.body);
      expect(response.statusCode).toEqual(200);
      expect(updatedTechRec.techRecord[0].euVehicleCategory).toEqual(newEuVehicleCategory);
    });
  });

  context("when updating a euVehicleCategory for an existing vehicle where the value is not null", () => {
    it("should throw error No EU vehicle category update required", async () => {
      const systemNumber = "10000001";
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve(cloneDeep([records[0]]));
          }
        };
      });
      expect.assertions(2);
      const {msUser, msOid } = msUserDetails;
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);
      const response: HTTPResponse | HTTPError = await techRecordsService.updateEuVehicleCategory(systemNumber, EU_VEHICLE_CATEGORY.M1, msOid, msUser);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(`"${HTTPRESPONSE.NO_EU_VEHICLE_CATEGORY_UPDATE_REQUIRED}"`);
    });
  });

  context("when finding more than one non-archived tech-records", () => {
    it("should throw error More than one non-archived records found", async () => {
      const systemNumber = "10000001";
      const record: any = cloneDeep(records[0]);
      const techRecord = record.techRecord[0];
      record.techRecord.push(techRecord);
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve([record]);
          }
        };
      });
      expect.assertions(2);
      const {msUser, msOid } = msUserDetails;
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);
      try {
        expect(await techRecordsService.updateEuVehicleCategory(systemNumber, EU_VEHICLE_CATEGORY.M1, msOid, msUser)).toThrowError();
      } catch (error) {
        expect(error.statusCode).toEqual(400);
        // FIXME: from array to string
        expect(error.body.errors).toContain(HTTPRESPONSE.EU_VEHICLE_CATEGORY_MORE_THAN_ONE_TECH_RECORD);
      }
    });
  });
  context("when finding only archived tech-records", () => {
    it("should throw error Cannot update archived tech-record", async () => {
      const systemNumber = "10000001";
      const archivedRecord: any = cloneDeep(records[0]);
      archivedRecord.techRecord[0].statusCode = "archived";
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve([archivedRecord]);
          }
        };
      });
      expect.assertions(2);
      const {msUser, msOid } = msUserDetails;
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);
      try {
        expect(await techRecordsService.updateEuVehicleCategory(systemNumber, EU_VEHICLE_CATEGORY.M1,msOid, msUser)).toThrowError();
      } catch (error) {
        expect(error.statusCode).toEqual(400);
        // FIXME: from array to string
        expect(error.body.errors).toContain(ERRORS.CANNOT_UPDATE_ARCHIVED_RECORD);
      }
    });
  });
});

describe("archiveTechRecordStatus", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  context("A technical record status is updated to archived via PUT verb", () => {
    it("should change the records status to archived and set audit details and create no other record", async () => {
      const techRecord: any = cloneDeep(records[43]);
      const reasonForArchiving = "Archive me";
      const expectedTechRecord = cloneDeep(techRecord);
      expectedTechRecord.techRecord[0].statusCode = STATUS.ARCHIVED;

      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          updateSingle: () => {
            return Promise.resolve({
              Attributes: expectedTechRecord
            });
          },
          getBySearchTerm: () => {
            return Promise.resolve([techRecord]);
          }
        };
      });
      expect.assertions(2);
      const techRecordsService = new TechRecordsService(new MockDAO());
      const updatedTechRec: any = await techRecordsService.archiveTechRecordStatus(techRecord.systemNumber, techRecord, msUserDetails, reasonForArchiving);
      expect(updatedTechRec.techRecord[0].statusCode).toEqual(STATUS.ARCHIVED);
      expect(updatedTechRec.techRecord.length).toEqual(1);
    });
  });

  context("when trying to archive a record which was sent with changed attributes on it", () => {
    it("should return Error 400 Cannot archive tech record with attribute changes", async () => {
      const techRecord: any = cloneDeep(records[43]);
      const reasonForArchiving = "Archive me";
      techRecord.techRecord[0].euVehicleCategory = "m3";

      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve(cloneDeep([records[43]]));
          }
        };
      });
      expect.assertions(3);
      const techRecordsService = new TechRecordsService(new MockDAO());
      try {
        expect(await techRecordsService.archiveTechRecordStatus(techRecord.systemNumber, techRecord, msUserDetails, reasonForArchiving)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(400);
        expect(errorResponse.body.errors).toContain(ERRORS.CANNOT_ARCHIVE_CHANGED_RECORD);
      }
    });
  });

  context("A technical record status is updated to archived via PUT verb", () => {
    it("should change the records status to archived and set audit details and create no other record", async () => {
      const techRecord: any = cloneDeep(records[43]);
      const reasonForArchiving = "Archive me";
      techRecord.techRecord[0].statusCode = STATUS.ARCHIVED;
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve([techRecord]);
          }
        };
      });
      expect.assertions(2);
      const techRecordsService = new TechRecordsService(new MockDAO());
      techRecordsService.archiveTechRecordStatus(techRecord.systemNumber, techRecord, msUserDetails, reasonForArchiving).catch((err) => {
        expect(err.statusCode).toEqual(400);
        expect(err.body.errors).toContain(ERRORS.CANNOT_UPDATE_ARCHIVED_RECORD);
      });
    });
  });
});


describe("updateTechRecordStatus", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  const createdByName = "dorel";
  const createdById = "1234";

  context("when updating the statusCode for an existing vehicle", () => {
    context("and the vehicle has only a current tech record", () => {
      it("should create new CURRENT, set the audit details and archive the previous current record", async () => {
        const existingTechRecord = cloneDeep(records[0]);
        const systemNumber = existingTechRecord.systemNumber;
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getBySearchTerm: () => {
              return Promise.resolve([existingTechRecord]);
            }
          };
        });
        expect.assertions(11);
        const mockDAO = new MockDAO();
        const techRecordStatusHandler = new TechRecordStatusHandler<HeavyGoodsVehicle>(new TechRecordsListHandler<HeavyGoodsVehicle>(mockDAO));
        const updatedTechRec = await techRecordStatusHandler.prepareTechRecordForStatusUpdate(systemNumber, undefined, createdById, createdByName);
        expect(updatedTechRec.techRecord.length).toEqual(2);
        expect(updatedTechRec.techRecord[1].createdById).toEqual(createdById);
        expect(updatedTechRec.techRecord[1].createdByName).toEqual(createdByName);
        expect(updatedTechRec.techRecord[1].statusCode).toEqual(STATUS.CURRENT);
        expect(updatedTechRec.techRecord[1]).not.toHaveProperty("lastUpdatedAt");
        expect(updatedTechRec.techRecord[1]).not.toHaveProperty("lastUpdatedByName");
        expect(updatedTechRec.techRecord[1]).not.toHaveProperty("lastUpdatedById");
        expect(updatedTechRec.techRecord[0].lastUpdatedById).toEqual(createdById);
        expect(updatedTechRec.techRecord[0].lastUpdatedByName).toEqual(createdByName);
        expect(updatedTechRec.techRecord[0].statusCode).toEqual(STATUS.ARCHIVED);
        expect(updatedTechRec.techRecord[0].updateType).toEqual(UPDATE_TYPE.TECH_RECORD_UPDATE);
      });
    });

    context("and the vehicle has only a provisional tech record", () => {
      it("should create new CURRENT, set the audit details and archive the previous provisional record", async () => {
        const existingTechRecord = cloneDeep(records[3]);
        const systemNumber = existingTechRecord.systemNumber;
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getBySearchTerm: () => {
              return Promise.resolve([existingTechRecord]);
            }
          };
        });
        expect.assertions(11);
        const mockDAO = new MockDAO();
        const techRecordStatusHandler = new TechRecordStatusHandler<PublicServiceVehicle>(new TechRecordsListHandler<PublicServiceVehicle>(mockDAO));

        const updatedTechRec: PublicServiceVehicle = await techRecordStatusHandler.prepareTechRecordForStatusUpdate(systemNumber, undefined, createdById, createdByName);
        expect(updatedTechRec.techRecord.length).toEqual(2);
        expect(updatedTechRec.techRecord[1].createdById).toEqual(createdById);
        expect(updatedTechRec.techRecord[1].createdByName).toEqual(createdByName);
        expect(updatedTechRec.techRecord[1].statusCode).toEqual(STATUS.CURRENT);
        expect(updatedTechRec.techRecord[1]).not.toHaveProperty("lastUpdatedAt");
        expect(updatedTechRec.techRecord[1]).not.toHaveProperty("lastUpdatedByName");
        expect(updatedTechRec.techRecord[1]).not.toHaveProperty("lastUpdatedById");
        expect(updatedTechRec.techRecord[0].lastUpdatedById).toEqual(createdById);
        expect(updatedTechRec.techRecord[0].lastUpdatedByName).toEqual(createdByName);
        expect(updatedTechRec.techRecord[0].statusCode).toEqual(STATUS.ARCHIVED);
        expect(updatedTechRec.techRecord[0].updateType).toEqual(UPDATE_TYPE.TECH_RECORD_UPDATE);
      });
    });

    context("and the vehicle has a current and a provisional record", () => {
      it("should create new CURRENT, set the audit details and archive the previous current and provisional record", async () => {
        const existingTechRecord = cloneDeep(records[44]);
        const systemNumber = existingTechRecord.systemNumber;
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getBySearchTerm: () => {
              return Promise.resolve([existingTechRecord]);
            }
          };
        });
        expect.assertions(15);
        const mockDAO = new MockDAO();
        const techRecordStatusHandler = new TechRecordStatusHandler<HeavyGoodsVehicle>(new TechRecordsListHandler<HeavyGoodsVehicle>(mockDAO));
        const updatedTechRec: HeavyGoodsVehicle = await techRecordStatusHandler.prepareTechRecordForStatusUpdate(systemNumber, undefined, createdById, createdByName);
        expect(updatedTechRec.techRecord.length).toEqual(3);
        expect(updatedTechRec.techRecord[2].createdById).toEqual(createdById);
        expect(updatedTechRec.techRecord[2].createdByName).toEqual(createdByName);
        expect(updatedTechRec.techRecord[2].statusCode).toEqual(STATUS.CURRENT);
        expect(updatedTechRec.techRecord[2]).not.toHaveProperty("lastUpdatedAt");
        expect(updatedTechRec.techRecord[2]).not.toHaveProperty("lastUpdatedByName");
        expect(updatedTechRec.techRecord[2]).not.toHaveProperty("lastUpdatedById");
        expect(updatedTechRec.techRecord[0].lastUpdatedById).toEqual(createdById);
        expect(updatedTechRec.techRecord[0].lastUpdatedByName).toEqual(createdByName);
        expect(updatedTechRec.techRecord[0].updateType).toEqual(UPDATE_TYPE.TECH_RECORD_UPDATE);
        expect(updatedTechRec.techRecord[0].statusCode).toEqual(STATUS.ARCHIVED);
        expect(updatedTechRec.techRecord[1].lastUpdatedById).toEqual(createdById);
        expect(updatedTechRec.techRecord[1].lastUpdatedByName).toEqual(createdByName);
        expect(updatedTechRec.techRecord[1].updateType).toEqual(UPDATE_TYPE.TECH_RECORD_UPDATE);
        expect(updatedTechRec.techRecord[1].statusCode).toEqual(STATUS.ARCHIVED);
      });
    });
  });
  describe("updateVin when passed a vehicle record and a vin", () => {
    context("with techRecord statuses: Archived, Current, Provisional", () => {
      const newVin = "123ABC";
      const vehicle = {
        vin: "ABC123",
        techRecord: [
          { recordCompleteness: "skeleton", statusCode: "archived" },
          { recordCompleteness: "testable", statusCode: "current" },
          { recordCompleteness: "complete", statusCode: "provisional" },
        ],
      } as unknown as Vehicle;
  
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve([vehicle]);
          },
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);
      const result = techRecordsService.updateVin(vehicle, newVin);
  
      it("returns two vehicle records (oldVehicle, newVehicle)", () => {
        expect(result.length).toEqual(2);
      });
      it("oldVehicle has a techRecord.length of 2: Archived x2", () => {
        expect(result[0].techRecord.length).toEqual(2);
      });
      it("oldVehicle vin is the same", () => {
        expect(result[0].vin).toEqual(vehicle.vin);
      });
      it("oldVehicle techRecord statuses are all archived", () => {
        expect(result[0].techRecord[0].statusCode).toEqual("archived");
        expect(result[0].techRecord[1].statusCode).toEqual("archived");
      });
      it("newVehicle has a techRecord.length of 1", () => {
        expect(result[1].techRecord.length).toEqual(1);
      });
      it("newVehicle techRecord has a status of Current", () => {
        expect(result[1].techRecord[0].statusCode).toEqual("current");
      });
      it("newVehicle vin is newVin value", () => {
        expect(result[1].vin).toEqual(newVin);
      });
    });
  
    context("with techRecord statuses Archived, Current, Archived", () => {
      const newVin = "123ABC";
      const vehicle = {
        vin: "ABC123",
        techRecord: [
          { recordCompleteness: "skeleton", statusCode: "archived" },
          { recordCompleteness: "complete", statusCode: "current" },
          { recordCompleteness: "testable", statusCode: "archived" },
        ],
      } as unknown as Vehicle;
  
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve([vehicle]);
          },
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);
  
      const result = techRecordsService.updateVin(vehicle, newVin);
      it("returns two vehicle records (oldVehicle, newVehicle)", () => {
        expect(result.length).toEqual(2);
      });
      it("oldVehicle has a techRecord.length of 3: Archived x2 and Current as archived", () => {
        expect(result[0].techRecord.length).toEqual(3);
      });
      it("oldVehicle vin is the same", () => {
        expect(result[0].vin).toEqual(vehicle.vin);
      });
      it("oldVehicle techRecord statuses are all archived", () => {
        expect(result[0].techRecord[0].statusCode).toEqual("archived");
        expect(result[0].techRecord[1].statusCode).toEqual("archived");
        expect(result[0].techRecord[2].statusCode).toEqual("archived");
      });
      it("newVehicle has a techRecord.length of 1", () => {
        expect(result[1].techRecord.length).toEqual(1);
      });
      it("newVehicle techRecord has a status of Current", () => {
        expect(result[1].techRecord[0].statusCode).toEqual("current");
      });
      it("newVehicle vin is newVin value", () => {
        expect(result[1].vin).toEqual(newVin);
      });
    });
  });
  
  context("with techRecord statuses Provisional, Archived, Archived", () => {
    const newVin = "123ABC";
    const vehicle = {
      vin: "ABC123",
      techRecord: [
        { recordCompleteness: "complete", statusCode: "provisional" },
        { recordCompleteness: "skeleton", statusCode: "archived" },
        { recordCompleteness: "testable", statusCode: "archived" },
      ],
    } as unknown as Vehicle;
  
    const MockDAO = jest.fn().mockImplementation(() => {
      return {
        getBySearchTerm: () => {
          return Promise.resolve([vehicle]);
        },
      };
    });
  
    const mockDAO = new MockDAO();
    const techRecordsService = new TechRecordsService(mockDAO);
  
    const result = techRecordsService.updateVin(vehicle, newVin);
    it("returns two vehicle records (oldVehicle, newVehicle)", () => {
      expect(result.length).toEqual(2);
    });
    it("oldVehicle has a techRecord.length of 3: Archived x3", () => {
      expect(result[0].techRecord.length).toEqual(3);
    });
    it("oldVehicle vin is the same", () => {
      expect(result[0].vin).toEqual(vehicle.vin);
    });
    it("oldVehicle techRecord statuses are all archived", () => {
      expect(result[0].techRecord[0].statusCode).toEqual("archived");
      expect(result[0].techRecord[1].statusCode).toEqual("archived");
    });
    it("newVehicle has a techRecord.length of 1", () => {
      expect(result[1].techRecord.length).toEqual(1);
    });
    it("newVehicle techRecord has a status of Provisional", () => {
      expect(result[1].techRecord[0].statusCode).toEqual("provisional");
    });
    it("newVehicle vin is newVin value", () => {
      expect(result[1].vin).toEqual(newVin);
    });
  });
});

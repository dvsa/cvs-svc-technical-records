import { cloneDeep } from "lodash";
import Configuration from "../../../src/utils/Configuration";
import mockData from "../../resources/technical-records.json";
import IMsUserDetails from "../../../@Types/IUserDetails";
import {
  VehicleProcessor,
  HgvProcessor,
  TrailerProcessor
} from "../../../src/domain/Processors";
import { STATUS, ERRORS, RECORD_COMPLETENESS } from '../../../src/assets/Enums';
import HTTPError from "../../../src/models/HTTPError";
import { HeavyGoodsVehicle, Trailer } from "../../../@Types/TechRecords";

/**
 * NOTE: to test private/protected functions @ts-ignore is used. This helps in testing smaller units of logic.
 */

const msUserDetails: IMsUserDetails = {
  msOid: "1234",
  msUser: "Blabla"
};

describe("VehicleProcessor", () => {
  describe("updateVehicle", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
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
      context(
        "and the user wants to update a record which doesn't have the specified statusCode",
        () => {
          it("should return error 404 Vehicle has no tech-records with status {statusCode}", async () => {
            // @ts-ignore
            const vehicle: HeavyGoodsVehicle = cloneDeep(mockData[43]);
            try {
              // @ts-ignore
              expect(await VehicleProcessor.getTechRecordToArchive(
                  vehicle,
                  STATUS.CURRENT
                )
              ).toThrowError();
            } catch (errorResponse) {
              expect(errorResponse).toBeInstanceOf(HTTPError);
              expect(errorResponse.statusCode).toEqual(404);
              expect(errorResponse.body.errors).toContain(
                "Vehicle has no tech-records with status current"
              );
            }
          });
        }
      );

      context(
        "and the user wants to update a record which doesn't have the specified statusCode",
        () => {
          it("should return error 500 Vehicle has no tech-records with status {statusCode}", async () => {
            // @ts-ignore
            const techRecord: ITechRecordWrapper = cloneDeep(mockData[43]);
            const recordToUpdate: any = {
              techRecord: [techRecord.techRecord[0], techRecord.techRecord[0]]
            };
            try {
              // @ts-ignore
              expect(await VehicleProcessor.getTechRecordToArchive(
                  recordToUpdate,
                  STATUS.PROVISIONAL
                )
              ).toThrowError();
            } catch (errorResponse) {
              expect(errorResponse).toBeInstanceOf(HTTPError);
              expect(errorResponse.statusCode).toEqual(500);
              // FIXME: decide between error array vs single error message
              expect(errorResponse.body.errors).toContain(
                "Vehicle has more than one tech-record with status provisional"
              );
            }
          });
        }
      );

      context(
        "and the user wants to change a record from provisional to current",
        () => {
          context("and the vehicle already has a current record", () => {
            it("should archive the current record and set the audit details", async () => {
              // @ts-ignore
              const techRecord: HeavyGoodsVehicle = cloneDeep(mockData[43]);
              techRecord.techRecord[0].statusCode = STATUS.CURRENT;
              const returnedVehicle: any = cloneDeep(mockData[43]);
              const provisionalRecord: any = cloneDeep(
                returnedVehicle.techRecord[0]
              );
              provisionalRecord.statusCode = STATUS.PROVISIONAL;
              returnedVehicle.techRecord[0].statusCode = STATUS.CURRENT;
              returnedVehicle.techRecord.push(provisionalRecord);
              const MockDAO = jest.fn().mockImplementation(() => {
                return {
                  getBySearchTerm: () => {
                    return Promise.resolve([returnedVehicle]);
                  }
                };
              });
              // FIXME: confirm whether this is a valid payload
              // const recordToUpdate: any = {
              //   techRecord: [techRecord.techRecord[0]]
              // };
              const hgvProcessor = new HgvProcessor(techRecord, new MockDAO());
              // @ts-ignore
              const updatedTechRecords = await hgvProcessor.createAndArchiveTechRecord(
                techRecord,
                msUserDetails,
                STATUS.PROVISIONAL
              );
              expect(updatedTechRecords.techRecord.length).toEqual(3);
              expect(updatedTechRecords.techRecord[0].statusCode).toEqual(
                STATUS.ARCHIVED
              );
              expect(
                updatedTechRecords.techRecord[0].lastUpdatedByName
              ).toEqual(msUserDetails.msUser);
              expect(updatedTechRecords.techRecord[0].lastUpdatedById).toEqual(
                msUserDetails.msOid
              );
              expect(updatedTechRecords.techRecord[1].statusCode).toEqual(
                STATUS.ARCHIVED
              );
              expect(
                updatedTechRecords.techRecord[1].lastUpdatedByName
              ).toEqual(msUserDetails.msUser);
              expect(updatedTechRecords.techRecord[1].lastUpdatedById).toEqual(
                msUserDetails.msOid
              );
              expect(updatedTechRecords.techRecord[2].statusCode).toEqual(
                STATUS.CURRENT
              );
            });
            it("should archive the current record and set the audit details calculate correct record completeness in case of a trailer", async () => {
              // @ts-ignore
              const techRecord: Trailer = cloneDeep(mockData[132]);
              techRecord.techRecord[0].statusCode = STATUS.CURRENT;
              const returnedVehicle: any = cloneDeep(mockData[132]);
              const provisionalRecord: any = cloneDeep(
                returnedVehicle.techRecord[0]
              );
              provisionalRecord.statusCode = STATUS.PROVISIONAL;
              returnedVehicle.techRecord[0].statusCode = STATUS.CURRENT;
              returnedVehicle.techRecord.push(provisionalRecord);
              const MockDAO = jest.fn().mockImplementation(() => {
                return {
                  getBySearchTerm: () => {
                    return Promise.resolve([returnedVehicle]);
                  }
                };
              });

              const trailerProcessor = new TrailerProcessor(techRecord, new MockDAO());
              // @ts-ignore
              const updatedTechRecords = await trailerProcessor.createAndArchiveTechRecord(
                techRecord,
                msUserDetails,
                STATUS.PROVISIONAL
              );
              expect(updatedTechRecords.techRecord.length).toEqual(3);
              expect(updatedTechRecords.techRecord[0].statusCode).toEqual(
                STATUS.ARCHIVED
              );
              expect(
                updatedTechRecords.techRecord[0].lastUpdatedByName
              ).toEqual(msUserDetails.msUser);
              expect(updatedTechRecords.techRecord[0].lastUpdatedById).toEqual(
                msUserDetails.msOid
              );
              expect(updatedTechRecords.techRecord[1].statusCode).toEqual(
                STATUS.ARCHIVED
              );
              expect(
                updatedTechRecords.techRecord[1].lastUpdatedByName
              ).toEqual(msUserDetails.msUser);
              expect(updatedTechRecords.techRecord[1].lastUpdatedById).toEqual(
                msUserDetails.msOid
              );
              expect(updatedTechRecords.techRecord[2].recordCompleteness).toEqual(
                RECORD_COMPLETENESS[0]
              );
            });
          });
        }
      );

      context(
        "and the user wants to update an attribute outside of the techRecords array",
        () => {
          context("and the user wants to update the primaryVrm", () => {
            context("and the new primaryVrm is valid", () => {
              context(
                "and the primaryVrm is not present on another vehicle",
                () => {
                  it("should set the new primaryVrm on the vehicle and update reason for creation", () => {
                    // @ts-ignore
                    const techRecord: HeavyGoodsVehicle = cloneDeep(
                      mockData[129]
                    );
                    // techRecord.vrms = [{isPrimary: true, vrm: "LKJH654"}];
                    const MockDAO = jest.fn().mockImplementation(() => {
                      return {
                        getBySearchTerm: () => {
                          return Promise.resolve({
                            Items: [],
                            Count: 0,
                            ScannedCount: 1
                          });
                        }
                      };
                    });
                    // @ts-ignore
                    const payload: HeavyGoodsVehicle = cloneDeep(mockData[129]);
                    const hgvProcessor = new HgvProcessor(
                      payload,
                      new MockDAO()
                    );
                    payload.techRecord[0].reasonForCreation = "Updated VRM";
                    payload.primaryVrm = "ABCD943";
                    // @ts-ignore
                    const updatedVehicle =  hgvProcessor.updateVehicleIdentifiers(
                      techRecord,
                      payload
                    );
                    expect(updatedVehicle.primaryVrm).toEqual("ABCD943");
                    expect(updatedVehicle.secondaryVrms?.length).toEqual(2);
                    expect(updatedVehicle.secondaryVrms).toContain("B999XFX");
                    expect(updatedVehicle.techRecord[0].reasonForCreation).toEqual(
                      `VRM updated from B999XFX to ABCD943. Updated VRM`
                    );
                  });
                }
              );

              context("and the vehicle didn't have VRMs", () => {
                it("should not append undefined into secondaryVrms array", () => {
                  // @ts-ignore
                  const techRecord: HeavyGoodsVehicle = cloneDeep(mockData[43]);
                  // techRecord.vrms = [];
                  delete techRecord.secondaryVrms;
                  delete techRecord.primaryVrm;
                  const MockDAO = jest.fn().mockImplementation(() => {
                    return {
                      getBySearchTerm: () => {
                        return Promise.resolve({
                          Items: [],
                          Count: 0,
                          ScannedCount: 1
                        });
                      }
                    };
                  });
                  // @ts-ignore
                  const payload: HeavyGoodsVehicle = cloneDeep(techRecord);
                  const hgvProcessor = new HgvProcessor(
                    techRecord,
                    new MockDAO()
                  );
                  payload.techRecord[0].reasonForCreation = "Updated VRM";
                  payload.primaryVrm = "ABCD943";
                  // @ts-ignore
                  const updatedRecord = hgvProcessor.updateVehicleIdentifiers(
                    techRecord,
                    payload
                  );
                  expect(updatedRecord.primaryVrm).toEqual("ABCD943");
                  expect(updatedRecord.secondaryVrms).toBeUndefined();
                });
              });

              context(
                "and the primaryVrm is already present on another vehicle",
                () => {
                  it("should return Error 400 primaryVrm already exists on a non-scrapped vehicle", async () => {
                    // @ts-ignore
                    const techRecord: HeavyGoodsVehicle = cloneDeep(
                      mockData[43]
                    );
                    // techRecord.vrms = [{isPrimary: true, vrm: "LKJH654"}];
                    const MockDAO = jest.fn().mockImplementation(() => {
                      return {
                        getBySearchTerm: () => {
                          return Promise.resolve([techRecord]);
                        }
                      };
                    });
                    // const techRecordsService = new TechRecordsService(new MockDAO());
                    // @ts-ignore
                    const payload: HeavyGoodsVehicle = cloneDeep(mockData[43]);
                    payload.primaryVrm = "ABCD943";
                    const hgvProcessor = new HgvProcessor(
                      payload,
                      new MockDAO()
                    );
                    // @ts-ignore
                    const response = await hgvProcessor.validateVrmWithHistory(
                      payload,
                      techRecord);
                    expect(response).toContain("Primary VRM ABCD943 already exists");
                  });

                  it("should set the new primaryVrm on the vehicle if it only exists on a scrapped vehicle", () => {
                    // @ts-ignore
                    const techRecord: HeavyGoodsVehicle = cloneDeep(
                      mockData[129]
                    );
                    // techRecord.vrms = [{isPrimary: true, vrm: "LKJH654"}];
                    const MockDAO = jest.fn().mockImplementation(() => {
                      return {
                        getBySearchTerm: () => {
                          return Promise.resolve({
                            Items: [],
                            Count: 0,
                            ScannedCount: 1
                          });
                        }
                      };
                    });
                    // @ts-ignore
                    const payload: HeavyGoodsVehicle = cloneDeep(mockData[129]);
                    const hgvProcessor = new HgvProcessor(
                      payload,
                      new MockDAO()
                    );
                    payload.techRecord[0].reasonForCreation = "Updated VRM";
                    payload.primaryVrm = "AA12BCD";
                    // @ts-ignore
                    const updatedVehicle =  hgvProcessor.updateVehicleIdentifiers(
                      techRecord,
                      payload
                    );
                    expect(updatedVehicle.primaryVrm).toEqual("AA12BCD");
                    expect(updatedVehicle.secondaryVrms?.length).toEqual(2);
                    expect(updatedVehicle.secondaryVrms).toContain("B999XFX");
                    expect(updatedVehicle.techRecord[0].reasonForCreation).toEqual(
                      `VRM updated from B999XFX to AA12BCD. Updated VRM`
                    );
                  });
                }
              );
            });
            context("and the new primaryVrm is invalid", () => {
              it("should return Error 400 PrimaryVrm is invalid", async () => {
                const techRecord: any = cloneDeep(mockData[43]);
                // techRecord.vrms = [{isPrimary: true, vrm: "LKJH654"}];
                const MockDAO = jest.fn().mockImplementation();
                const payload: any = cloneDeep(mockData[43]);
                payload.primaryVrm = "ABCD94329339239";
                const hgvProcessor = new HgvProcessor(payload, new MockDAO());
                try {
                  // @ts-ignore
                  expect(await hgvProcessor.validate(
                    techRecord,
                    false)
                  ).toThrowError();
                } catch (errorResponse) {
                  expect(errorResponse.statusCode).toEqual(400);
                  expect(errorResponse.body.errors).toContain(
                    ERRORS.INVALID_PRIMARY_VRM
                  );
                }
              });
            });
          });

          context("and the user wants to update the trailerId", () => {
            context("and the new trailerId is valid", () => {
              context(
                "and the trailerId is not same as the old trailerId",
                () => {
                  it("should set the new trailerId on the vehicle and update reason for creation", () => {
                    const techRecord: any = cloneDeep(mockData[78]);
                    techRecord.trailerId = "MMMP324";
                    // techRecord.vrms = [];
                    const MockDAO = jest.fn().mockImplementation(() => {
                      return {
                        getBySearchTerm: () => {
                          return Promise.resolve({
                            Items: [],
                            Count: 0,
                            ScannedCount: 1
                          });
                        }
                      };
                    });
                    // @ts-ignore
                    const payload: Trailer = cloneDeep(mockData[78]);
                    payload.techRecord[0].reasonForCreation =
                      "Updated TrailerId";
                    payload.trailerId = "ABCD943";
                    const trailerProcessor = new TrailerProcessor(
                      payload,
                      new MockDAO()
                    );
                    // @ts-ignore
                    const updatedRecord = trailerProcessor.updateVehicleIdentifiers(
                      techRecord,
                      payload
                    );
                    expect(updatedRecord.trailerId).toEqual("ABCD943");
                    expect(updatedRecord.techRecord[0].reasonForCreation).toEqual(
                      `Trailer Id updated from MMMP324 to ABCD943. Updated TrailerId`
                    );
                  });
                }
              );
              context(
                "and the trailerId is already present on another vehicle",
                () => {
                  it("should return Error 400 trailerId already exists", async () => {
                    // @ts-ignore
                    const techRecord: Trailer = cloneDeep(mockData[78]);
                    const MockDAO = jest.fn().mockImplementation(() => {
                      return {
                        getBySearchTerm: () => {
                          return Promise.resolve([techRecord]);
                        }
                      };
                    });
                    // @ts-ignore
                    const payload: Trailer = cloneDeep(mockData[78]);
                    payload.trailerId = "ABCD943";
                    const trailerProcessor = new TrailerProcessor(
                      payload,
                      new MockDAO()
                    );
                    try {
                      // @ts-ignore
                      expect(await trailerProcessor.validateVrmWithHistory(
                          payload,
                          techRecord
                        )
                      ).toThrowError();
                    } catch (errorResponse) {
                      expect(errorResponse.statusCode).toEqual(400);
                      expect(errorResponse.body.errors).toContain(
                        "TrailerId ABCD943 already exists"
                      );
                    }
                  });
                }
              );
            });
            context("and the new trailerId is invalid", () => {
              it("should return Error 400 PrimaryVrm is invalid", () => {
                const MockDAO = jest.fn().mockImplementation();
                // @ts-ignore
                const payload: Trailer = cloneDeep(mockData[78]);
                payload.trailerId = "ABCD94329339239";
                const trailerProcessor = new TrailerProcessor(
                  payload,
                  new MockDAO()
                );
                try {
                  // @ts-ignore
                  trailerProcessor.validate(payload, false);
                } catch (errorResponse) {
                  expect(errorResponse.statusCode).toEqual(400);
                  expect(errorResponse.body.errors).toContain(
                    ERRORS.INVALID_TRAILER_ID
                  );
                }
              });
            });
          });

          context("and the user wants to update the secondaryVrms", () => {
            context("and the new secondaryVrms are valid", () => {
              it("should set the new secondaryVrms on the vehicle", () => {
                // @ts-ignore
                const techRecord: Trailer = cloneDeep(mockData[43]);
                const MockDAO = jest.fn().mockImplementation();
                // @ts-ignore;
                const payload: Trailer = cloneDeep(mockData[43]);
                payload.secondaryVrms = ["ABCD943"];
                const trailerProcessor = new TrailerProcessor(
                  payload,
                  new MockDAO()
                );
                // @ts-ignore
                trailerProcessor.updateVehicleIdentifiers(
                  payload,
                  techRecord
                );
                expect(techRecord.secondaryVrms).toEqual(["ABCD943"]);
              });
            });
            context("and the new secondaryVrms are invalid", () => {
              it("should return Error 400 SecondaryVrms are invalid", () => {
                // @ts-ignore
                const techRecord: Trailer = cloneDeep(mockData[43]);
                const MockDAO = jest.fn().mockImplementation();
                // @ts-ignore;
                const payload: Trailer = cloneDeep(mockData[43]);
                const trailerProcessor = new TrailerProcessor(
                  payload,
                  new MockDAO()
                );
                payload.secondaryVrms = ["ABCD94329339239"];
                try {
                  // @ts-ignore
                  trailerProcessor.validate(payload, false);
                } catch (errorResponse) {
                  expect(errorResponse.statusCode).toEqual(400);
                  expect(errorResponse.body.errors).toContain(
                    ERRORS.INVALID_SECONDARY_VRM
                  );
                }
              });
            });
          });
        }
      );
    });
  });
});

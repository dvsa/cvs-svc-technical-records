/* global describe context it before beforeEach after afterEach */
import supertest from "supertest";
import stitchedRecords from "../resources/stitchedUpTechRecords.json";

const url = "http://localhost:3005/";
const request = supertest(url);
import {
  populateDatabase,
  emptyDatabase,
  convertToResponse,
} from "../util/dbOperations";
import mockData from "../resources/technical-records.json";
import { HTTPRESPONSE } from "../../src/assets/Enums";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import { cloneDeep } from "lodash";

const msUserDetails = {
  msUser: "dorel",
  msOid: "1234545",
};

describe("techRecords", () => {
  describe("getTechRecords", () => {
    beforeAll(async () => {
      await populateDatabase();
    });

    beforeEach(async () => {
      // await populateDatabase();
    });

    afterEach(async () => {
      //  await emptyDatabase();
    });

    afterAll(async () => {
      await emptyDatabase();
    });

    context("and when a search by VRM is done", () => {
      context("and no statusCode is provided", () => {
        context(
          "and the tech record for that VRM has statusCode 'current'",
          () => {
            it("should return the tech record for that VRM with status 'current'", async () => {
              const res = await request.get("vehicles/JY58FPP/tech-records");
              expect(res.status).toEqual(200);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body).toEqual(convertToResponse(mockData[0]));
            });
          }
        );

        context(
          "and the tech record for that VRM does not have statusCode 'current'",
          () => {
            it("should return 404", async () => {
              const res = await request.get("vehicles/V916FSB/tech-records");
              expect(res.status).toEqual(404);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body.errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
            });
          }
        );
      });

      context("and statusCode is provided", () => {
        context(
          "and the tech record for that VRM has the statusCode provided",
          () => {
            it("should return the tech record for that VRM with statusCode 'archived'", async () => {
              const res = await request.get(
                "vehicles/AA12BCD/tech-records?status=archived"
              );
              expect(res.status).toEqual(200);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(convertToResponse(mockData[2])).toEqual(res.body);
            });
          }
        );

        context(
          "and the tech record for that VRM does not have statusCode 'archived'",
          () => {
            it("should return 404", async () => {
              const res = await request.get(
                "vehicles/BQ91YHQ/tech-records?status=archived"
              );
              expect(res.status).toEqual(404);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body.errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
            });
          }
        );
      });

      context("and the vehicle has more than one tech record", () => {
        it("should return all tech records for that VRM", async () => {
          const res: supertest.Response = await request.get(
            "vehicles/C47WLL/tech-records?status=all"
          );
          expect(res.status).toEqual(200);
          expect(res.header["access-control-allow-origin"]).toEqual("*");
          expect(res.header["access-control-allow-credentials"]).toEqual(
            "true"
          );
          expect(convertToResponse(mockData[8])).toEqual(res.body);
          expect(res.body[0].techRecord.length).toEqual(
            mockData[8].techRecord.length
          );
        });
      });
    });

    context("and when a search by partial VIN is done", () => {
      context("and no statusCode is provided", () => {
        context(
          "and the tech record for that partial VIN has statusCode 'current'",
          () => {
            it("should return the tech record for that partial VIN with status 'current'", async () => {
              const res = await request.get("vehicles/012345/tech-records");
              expect(res.status).toEqual(200);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(convertToResponse(mockData[0])).toEqual(res.body);
            });
          }
        );

        context(
          "and the tech record for that partial VIN does not have status code current or provisional",
          () => {
            it("should return 404", async () => {
              const res = await request.get("vehicles/541234/tech-records");
              expect(res.status).toEqual(404);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body.errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
            });
          }
        );
      });

      context("and statusCode is provided", () => {
        context(
          "and the tech record for that partial VIN has the statusCode provided",
          () => {
            it("should return the tech record for that partial VIN with statusCode 'archived'", async () => {
              const res = await request.get(
                "vehicles/012461/tech-records?status=archived"
              );
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(convertToResponse(mockData[2])).toEqual(res.body);
              expect(res.status).toEqual(200);
            });
          }
        );

        context(
          "and the tech record for that partial VIN does not have statusCode 'archived'",
          () => {
            it("should return 404", async () => {
              const res = await request.get(
                "vehicles/012345/tech-records?status=archived"
              );
              expect(res.status).toEqual(404);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body.errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
            });
          }
        );
      });

      context("and the vehicle has more than one tech record", () => {
        it("should return all tech records for that partial VIN", async () => {
          const res = await request.get(
            "vehicles/011900/tech-records?status=all"
          );
          expect(res.status).toEqual(200);
          expect(res.header["access-control-allow-origin"]).toEqual("*");
          expect(res.header["access-control-allow-credentials"]).toEqual(
            "true"
          );
          expect(convertToResponse(mockData[8])).toEqual(res.body);
          expect(res.body[0].techRecord.length).toEqual(
            mockData[8].techRecord.length
          );
        });
      });

      context(
        "and the partial VIN provided returns more than one match",
        () => {
          it("should return an array of all matches", async () => {
            const res = await request.get("vehicles/678413/tech-records");
            expect(res.status).toEqual(200);
            expect(res.header["access-control-allow-origin"]).toEqual("*");
            expect(res.header["access-control-allow-credentials"]).toEqual(
              "true"
            );
            expect(res.body).toHaveLength(2);
          });
        }
      );
    });

    context("and when a search by full VIN is done", () => {
      context("and no statusCode is provided", () => {
        context(
          "and the tech record for that full VIN has statusCode 'current'",
          () => {
            it("should return the tech record for that full VIN with status 'current'", async () => {
              const res = await request.get(
                "vehicles/XMGDE02FS0H012345/tech-records"
              );
              expect(res.status).toEqual(200);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(convertToResponse(mockData[0])).toEqual(res.body);
            });
          }
        );

        context(
          "and the tech record for that full VIN does not have statusCode 'current'",
          () => {
            it("should return 404", async () => {
              const res = await request.get(
                "vehicles/XMGDE02FS0H012461/tech-records"
              );
              expect(res.status).toEqual(404);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body.errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
            });
          }
        );
      });

      context("and statusCode is provided", () => {
        context(
          "and the tech record for that full VIN has the statusCode provided",
          () => {
            it("should return the tech record for that full VIN with statusCode 'archived'", async () => {
              const res = await request.get(
                "vehicles/XMGDE02FS0H012461/tech-records?status=archived"
              );
              expect(res.status).toEqual(200);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(convertToResponse(mockData[2])).toEqual(res.body);
            });
          }
        );

        context(
          "and the tech record for that full VIN does not have statusCode 'archived'",
          () => {
            it("should return 404", async () => {
              const res = await request.get(
                "vehicles/XMGDE02FS0H012345/tech-records?status=archived"
              );
              expect(res.status).toEqual(404);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body.errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
            });
          }
        );
      });

      context("and the vehicle has more than one tech record", () => {
        it("should return all tech records for that full VIN", async () => {
          const res = await request.get(
            "vehicles/YV31MEC18GA011900/tech-records?status=all"
          );
          expect(res.status).toEqual(200);
          expect(res.header["access-control-allow-origin"]).toEqual("*");
          expect(res.header["access-control-allow-credentials"]).toEqual(
            "true"
          );
          expect(convertToResponse(mockData[8])).toEqual(res.body);
          expect(res.body[0].techRecord.length).toEqual(
            mockData[8].techRecord.length
          );
        });
      });
    });

    context("and when a search by Trailer ID is done", () => {
      context("and no statusCode is provided", () => {
        context(
          "and the tech record for that Trailer ID has statusCode 'current'",
          () => {
            it("should return the tech record for that Trailer ID with status 'current'", async () => {
              const res = await request.get("vehicles/09876543/tech-records");
              expect(res.status).toEqual(200);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body).toEqual(convertToResponse(mockData[0]));
            });
          }
        );

        context(
          "and the tech record for that TrailerID does not have statusCode 'current'",
          () => {
            it("should return 404", async () => {
              const res = await request.get("vehicles/A456789/tech-records");
              expect(res.status).toEqual(404);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body.errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
            });
          }
        );
      });

      context("and statusCode is provided", () => {
        context(
          "and the tech record for that Trailer ID has the statusCode provided",
          () => {
            it("should return the tech record for that Trailer ID with statusCode 'archived'", async () => {
              const res = await request.get(
                "vehicles/A456789/tech-records?status=archived"
              );
              expect(res.status).toEqual(200);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(convertToResponse(mockData[2])).toEqual(res.body);
            });
          }
        );

        context(
          "and the tech record for that Trailer ID does not have statusCode 'archived'",
          () => {
            it("should return 404", async () => {
              const res = await request.get(
                "vehicles/09876543/tech-records?status=archived"
              );
              expect(res.status).toEqual(404);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body.errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
            });
          }
        );
      });

      context("and the vehicle has more than one tech record", () => {
        it("should return all tech records for that Trailer ID", async () => {
          const res = await request.get(
            "vehicles/09876543/tech-records?status=all"
          );
          expect(res.status).toEqual(200);
          expect(res.header["access-control-allow-origin"]).toEqual("*");
          expect(res.header["access-control-allow-credentials"]).toEqual(
            "true"
          );
          expect(convertToResponse(mockData[0])).toEqual(res.body);
          expect(res.body[0].techRecord.length).toEqual(
            mockData[0].techRecord.length
          );
        });
      });
    });

    context("and when a search by system number is done", () => {
      context("and no status code is provided", () => {
        context("and there are multiple dynamodb records for that system number", () => {
          it("should return a stitched up record for that system number with the most recent vin at the base of the tech record", async () => {
            const res = await request.get(
              "vehicles/11220280/tech-records?status=all&searchCriteria=systemNumber"
            );
            console.log(res.body);
            expect(res.status).toEqual(200);
            expect(res.header["access-control-allow-origin"]).toEqual("*");
            expect(res.header["access-control-allow-credentials"]).toEqual(
              "true"
            );
            expect(res.body.length).toEqual(1);
            expect(res.body).toEqual([stitchedRecords]);
            expect(res.body[0].techRecord.length).toEqual(
              4
            );
          });
        });
      });
    });
  });

  describe("postTechRecords", () => {
    context("when database is populated", () => {
      beforeAll(async () => {
        // await emptyDatabase();
        await populateDatabase();
      });

      afterAll(async () => {
        // await populateDatabase();
        await emptyDatabase();
      });

      beforeEach(async () => {
        // await populateDatabase();
      });

      afterEach(async () => {
        // await emptyDatabase();
      });

      context("and when trying to create a new vehicle", () => {
        context("and the payload is valid", () => {
          context("and that vehicle does not exist", () => {
        it("should return status 201 Technical Record created", async () => {
          const techRec: any = cloneDeep(mockData[43]);
          const vin = Date.now().toString();
          techRec.techRecord[0].bodyType.description = "skeletal";
          const primaryVrm = Math.floor(
            100000 + Math.random() * 900000
          ).toString();
          delete techRec.techRecord[0].statusCode;
          const payload = {
            msUserDetails,
            vin,
            primaryVrm,
            techRecord: techRec.techRecord,
          };
          const res = await request.post("vehicles").send(payload);
          expect(res.status).toEqual(201);
          expect(res.header["access-control-allow-origin"]).toEqual("*");
          expect(res.header["access-control-allow-credentials"]).toEqual(
            "true"
          );
          expect(res.body).toEqual("Technical Record created");
        });
          });
        });

        context("and the payload is invalid", () => {
          context("and the techRecord array is empty", () => {
            it("should return status 400 The conditional request failed", async () => {
              const techRec: any = cloneDeep(mockData[43]);
              delete techRec.techRecord[0].statusCode;
              const payload = {
                msUserDetails,
                vin: techRec.vin,
                systemNumber: techRec.systemNumber,
                techRecord: [],
              };
              const res = await request.post("vehicles").send(payload);
              expect(res.status).toEqual(400);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body).toEqual("Body is not a valid TechRecord");
            });
          });
        });
      });
    });
  });

  describe("updateTechRecords", () => {
    context("when database is populated", () => {
      beforeAll(async () => {
        // await emptyDatabase();
        await populateDatabase();
      });

      afterAll(async () => {
        // await populateDatabase();
      });

      beforeEach(async () => {
        // await populateDatabase();
      });

      afterEach(async () => {
        await emptyDatabase();
      });

      context("and when trying to update a vehicle", () => {
        context("and the path parameter system number is valid", () => {
          context("and that vehicle does exist", () => {
            it("should return status 200 and the updated vehicle", async () => {
              // @ts-ignore
              const techRec: ITechRecordWrapper = cloneDeep(mockData[130]);
              const primaryVrm = "ZYAG/ \\*-";
              const payload = {
                msUserDetails,
                primaryVrm,
                techRecord: techRec.techRecord,
              };
              const res = await request.put(`vehicles/${techRec.systemNumber}`).send(payload);
              expect(res.status).toEqual(200);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual("true");
              expect(res.body.techRecord).toHaveLength(techRec.techRecord.length + 1);
              expect(res.body.techRecord[techRec.techRecord.length].statusCode).toEqual("provisional");
              expect(res.body.techRecord[techRec.techRecord.length - 1].statusCode).toEqual("archived");
            });

            it("should populate the historic Vrms for auditing history", async () => {
              await populateDatabase();
              const techRec = cloneDeep(mockData[132]) as ITechRecordWrapper;
              const primaryVrm = "ZYAG/ \\*-";
              const payload = {
                msUserDetails,
                primaryVrm,
                techRecord: techRec.techRecord,
              };
              const res = await request.put(`vehicles/${techRec.systemNumber}`).send(payload);
              expect(res.status).toEqual(200);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual("true");
              expect(res.body.techRecord).toHaveLength(techRec.techRecord.length + 1);
              expect(res.body.techRecord[techRec.techRecord.length].statusCode).toEqual("provisional");
              expect(res.body.techRecord[techRec.techRecord.length].historicPrimaryVrm).toBe(undefined);
              expect(res.body.techRecord[techRec.techRecord.length - 1].statusCode).toEqual("archived");
              expect(res.body.techRecord[techRec.techRecord.length - 1].historicPrimaryVrm).toEqual("B2C1C12");
              expect(res.body.techRecord[techRec.techRecord.length - 1].historicSecondaryVrms).toEqual(["E5F1I00"]);
            });

            it("should also update the Vrms array to add the new primary vrm", async () => {
              await populateDatabase();
              const techRec = cloneDeep(mockData[132]) as ITechRecordWrapper;
              const primaryVrm = "ZYAG/ \\*-";

              const payload = {
                msUserDetails,
                primaryVrm,
                techRecord: techRec.techRecord,
              };
              const expectedVrms = [
                { vrm: "ZYAG/ \\*-", isPrimary: true },
                { vrm: "E5F1I00", isPrimary: false },
                { vrm: "B2C1C12", isPrimary: false },
              ];
              const res = await request.put(`vehicles/${techRec.systemNumber}`).send(payload);
              expect(res.status).toEqual(200);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual("true");
              expect(res.body.vrms).toEqual(expectedVrms);
            });

            it("should return status 200 and updated trailer with the updated trailer Id in upper case", async () => {
              // @ts-ignore
              const techRec: ITechRecordWrapper = cloneDeep(mockData[131]);
              const payload = {
                msUserDetails,
                ...techRec,
              };
              const res = await request
                .put(`vehicles/${techRec.systemNumber}`)
                .send(payload);
              expect(res.status).toEqual(200);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body.techRecord).toHaveLength(
                techRec.techRecord.length + 1
              );
              expect(
                res.body.techRecord[techRec.techRecord.length].statusCode
              ).toEqual("provisional");
              expect(
                res.body.techRecord[techRec.techRecord.length - 1].statusCode
              ).toEqual("archived");
            });
          });

          context("and that vehicle does not exist", () => {
            it("should return error status 404 No resources match the search criteria", async () => {
              // @ts-ignore
              const techRec: ITechRecordWrapper = cloneDeep(mockData[43]);
              const {primaryVrm} = techRec;
              const vin = Date.now().toString();
              delete techRec.techRecord[0].statusCode;
              const payload = {
                msUserDetails,
                primaryVrm,
                systemNumber: "NOT A VALID SYSTEM NUMBER",
                techRecord: techRec.techRecord,
              };
              const res = await request.put(`vehicles/${vin}`).send(payload);
              expect(res.status).toEqual(404);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body.errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
            });
          });

          context("and the techRecord array is empty", () => {
            it("should return error status 400 Body is not a valid TechRecord", async () => {
              // @ts-ignore
              const techRec: ITechRecordWrapper = cloneDeep(mockData[1]);
              techRec.techRecord = [];
              const res = await request
                .put(`vehicles/${techRec.vin}`)
                .send(techRec);
              expect(res.status).toEqual(400);
              expect(res.header["access-control-allow-origin"]).toEqual("*");
              expect(res.header["access-control-allow-credentials"]).toEqual(
                "true"
              );
              expect(res.body.errors).toContain(
                "Body is not a valid TechRecord"
              );
            });
          });
        });
      });
    });
  });
});

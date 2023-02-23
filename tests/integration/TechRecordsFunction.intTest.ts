import LambdaTester from "lambda-tester";
import { cloneDeep } from "lodash";
import { HTTPRESPONSE } from "../../src/assets/Enums";
import {
  getTechRecords as GetTechRecordsFunction
} from "../../src/functions/getTechRecords";
import { postTechRecords as PostTechRecordsFunction } from "../../src/functions/postTechRecords";
import { updateTechRecords as UpdateTechRecordsFunction } from "../../src/functions/updateTechRecords";
import { updateVin } from "../../src/functions/updateVin";
import HTTPResponse from "../../src/models/HTTPResponse";
import Configuration from "../../src/utils/Configuration";
import records from "../resources/technical-records.json";
import { emptyDatabase, populateDatabase } from "../util/dbOperations";

const msUserDetails = {
  msUser: "dorel",
  msOid: "1234545",
};

describe("getTechRecords", () => {
  beforeAll(async () => {
    jest.restoreAllMocks();
    // await emptyDatabase();
    await populateDatabase();
  });
  beforeEach(async () => {
    // await populateDatabase();
  });
  afterEach(async () => {
    // await emptyDatabase();
  });
  afterAll(async () => {
    // await populateDatabase();
    await emptyDatabase();
  });
  context("when the path is invalid", () => {
    it("should return 400 when search identifier is undefined", async () => {
      // Event has a path, but the path does not contain a Search Term
      await LambdaTester(GetTechRecordsFunction)
        .event({
          path: "/vehicles/undefined/tech-records",
          pathParameters: {
            searchIdentifier: undefined
          }
        })
        .expectResolve((result: any) => {
          expect(result.statusCode).toEqual(400);
          // Path checking now handled in the handler. Now only checking for Path Params
          expect(result.body).toEqual(
            JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS)
          );
        });
    });
    it("should return 400 when search identifier is undefined", async () => {
      // Event has a path, but the path does not contain a Search Term
      await LambdaTester(GetTechRecordsFunction)
        .event({
          path: "/vehicles/null/tech-records",
          pathParameters: {
            searchIdentifier: null
          }
        })
        .expectResolve((result: any) => {
          expect(result.statusCode).toEqual(400);
          // Path checking now handled in the handler. Now only checking for Path Params
          expect(result.body).toEqual(
            JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS)
          );
        });
    });
  });

  context("when the path is valid", () => {
    context("and the vehicle was found", () => {
      it("should return 200", async () => {
        await LambdaTester(GetTechRecordsFunction)
          .event({
            path: "/vehicles/XMGDE02FS0H012345/tech-records",
            pathParameters: {
              searchIdentifier: "XMGDE02FS0H012345",
            },
            queryStringParameters: {
              status: "current",
              metadata: "true",
            },
          })
          .expectResolve((result: any) => {
            const record = JSON.parse(result.body)[0];
            expect(result.statusCode).toEqual(200);
            expect(record.vin).toEqual("XMGDE02FS0H012345");
            expect(record).toHaveProperty("metadata");
          });
      });
    });

    context("and the vehicle was not found", () => {
      it("should return 404", async () => {
        await LambdaTester(GetTechRecordsFunction)
          .event({
            path: "/vehicles/ABCDE02FS0H012345/tech-records",
            pathParameters: {
              searchIdentifier: "ABCDE02FS0H012345",
            },
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toEqual(404);
            // FIXME: array to string
            expect(result.body).toContain(
              '"No resources match the search criteria."'
            );
          });
      });
    });

    context("and the search identifier is lower than 3", () => {
      it("should return 400", async () => {
        await LambdaTester(GetTechRecordsFunction)
          .event({
            path: "/vehicles/XM/tech-records",
            pathParameters: {
              searchIdentifier: "XM",
            },
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toEqual(400);
            expect(result.body).toEqual(
              '"The search identifier should be between 3 and 21 characters."'
            );
          });
      });
    });
  });
});

describe("postTechRecords", () => {
  beforeAll(async () => {
    jest.restoreAllMocks();
    // await emptyDatabase();
    await populateDatabase();
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(false);
  });
  beforeEach(async () => {
    // await populateDatabase();
  });
  afterEach(async () => {
    // await emptyDatabase();
  });
  afterAll(async () => {
    // await populateDatabase();
    await emptyDatabase();
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(true);
  });

  context("when trying to create a new vehicle", () => {
    context("and the vehicle was not found", () => {
      it("should return 201 created", async () => {
        // @ts-ignore
        const techRecord: HeavyGoodsVehicle = cloneDeep(records[43]);
        delete techRecord.techRecord[0].statusCode;
        techRecord.vin = Date.now().toString().substring(8);

        const payload = {
          vin: techRecord.vin,
          msUserDetails,
          primaryVrm: Math.floor(100000 + Math.random() * 900000).toString(),
          techRecord: techRecord.techRecord,
        };

        await LambdaTester(PostTechRecordsFunction)
          .event({
            path: "/vehicles",
            body: payload,
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toEqual(201);
            expect(result.body).toEqual('"Technical Record created"');
          });
      });
    });

    context("and the msUserDetails is not provided", () => {
      it("should return 400 Microsoft user details not provided", async () => {
        const techRecord: any = cloneDeep(records[43]);
        delete techRecord.techRecord[0].statusCode;
        techRecord.vin = Date.now().toString();

        const payload = {
          vin: techRecord.vin,
          techRecord: techRecord.techRecord,
        };
        await LambdaTester(PostTechRecordsFunction)
          .event({
            path: "/vehicles",
            body: payload,
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toEqual(400);
            expect(result.body).toEqual(
              '"Microsoft user details not provided"'
            );
          });
      });
    });

    context("and the techRecord array is empty", () => {
      it("should return 400 invalid TechRecord", async () => {
        // @ts-ignore
        const techRecord: HeavyGoodsVehicle = cloneDeep(records[43]);
        const { primaryVrm, secondaryVrms } = techRecord;
        delete techRecord.techRecord[0].statusCode;
        techRecord.vin = Date.now().toString();

        const payload = {
          vin: techRecord.vin,
          msUserDetails,
          primaryVrm,
          secondaryVrms,
          techRecord: [],
        };
        await LambdaTester(PostTechRecordsFunction)
          .event({
            path: "/vehicles",
            body: payload,
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toEqual(400);
            expect(result.body).toEqual('"Body is not a valid TechRecord"');
          });
      });
    });

    context("and the event body is empty", () => {
      it("should return 400 invalid TechRecord", async () => {
        const techRecord = cloneDeep(records[0]);

        techRecord.vin = Date.now().toString();
        techRecord.partialVin = techRecord.vin.substr(
          techRecord.vin.length - 6
        );
        techRecord.techRecord = [];
        await LambdaTester(PostTechRecordsFunction)
          .event({
            path: "/vehicles",
            body: undefined,
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toEqual(400);
            expect(result.body).toEqual("\"Invalid body field 'vin'\"");
          });
      });
    });
  });
});

describe("updateTechRecords", () => {
  beforeAll(async () => {
    jest.restoreAllMocks();
    await emptyDatabase();
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(false);
  });
  beforeEach(async () => {
    await populateDatabase();
  });
  afterEach(async () => {
    await emptyDatabase();
  });
  afterAll(async () => {
    await populateDatabase();
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(true);
  });

  context("when trying to update a vehicle", () => {
    context("and the path parameter systemNumber is valid", () => {
      context("and the vehicle was found", () => {
        it("should return 200 and the updated vehicle", async () => {
          // @ts-ignore
          const techRecord: HeavyGoodsVehicle = cloneDeep(records[43]);
          const { primaryVrm, secondaryVrms } = techRecord;
          const payload = {
            msUserDetails,
            primaryVrm,
            secondaryVrms,
            techRecord: techRecord.techRecord,
          };
          const systemNumber = techRecord.systemNumber;
          await LambdaTester(UpdateTechRecordsFunction)
            .event({
              path: `/vehicles/${systemNumber}`,
              pathParameters: {
                systemNumber,
              },
              body: payload,
            })
            .expectResolve((result: any) => {
              const updatedTechRes = JSON.parse(result.body);
              expect(result.statusCode).toEqual(200);
              expect(
                updatedTechRes.techRecord[techRecord.techRecord.length]
                  .statusCode
              ).toEqual("provisional");
              expect(
                updatedTechRes.techRecord[techRecord.techRecord.length - 1]
                  .statusCode
              ).toEqual("archived");
            });
        });
      });

      context("and the vehicle was not found", () => {
        it("should return 404 Not found", async () => {
          // @ts-ignore
          const techRecord: HeavyGoodsVehicle = cloneDeep(records[43]);
          const { primaryVrm, secondaryVrms } = techRecord;
          delete techRecord.techRecord[0].statusCode;
          const systemNumber = "NOT A SYSTEM NUMBER";
          const payload = {
            msUserDetails,
            systemNumber,
            primaryVrm,
            secondaryVrms,
            techRecord: techRecord.techRecord,
          };
          await LambdaTester(UpdateTechRecordsFunction)
            .event({
              path: `/vehicles/${systemNumber}`,
              pathParameters: {
                systemNumber,
              },
              body: payload,
            })
            .expectResolve((result: any) => {
              console.log(result);
              expect(result.statusCode).toEqual(404);
              // FIXME: need to discuss string array vs string message
              expect(JSON.parse(result.body).errors).toContain(
                HTTPRESPONSE.RESOURCE_NOT_FOUND
              );
            });
        });
      });

      context("and the techRecord array is empty", () => {
        it("should return 400 invalid TechRecord", async () => {
          const techRecord = cloneDeep(records[29]);
          const payload = {
            msUserDetails,
            techRecord: [],
          };
          const systemNumber = Date.now().toString();
          techRecord.techRecord = [];
          await LambdaTester(UpdateTechRecordsFunction)
            .event({
              path: `/vehicles/${systemNumber}`,
              pathParameters: {
                systemNumber,
              },
              body: payload,
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(JSON.parse(result.body).errors).toContain(
                "Body is not a valid TechRecord"
              );
            });
        });
      });

      context("and the msUserDetails is not provided", () => {
        it("should return 400 invalid TechRecord", async () => {
          const techRecord: any = cloneDeep(records[29]);
          const payload = {
            techRecord: [
              {
                reasonForCreation: techRecord.techRecord[0].reasonForCreation,
                adrDetails: techRecord.techRecord[0].adrDetails,
              },
            ],
          };
          const systemNumber = Date.now().toString();
          techRecord.techRecord = [];
          await LambdaTester(UpdateTechRecordsFunction)
            .event({
              path: `/vehicles/${systemNumber}`,
              pathParameters: {
                systemNumber,
              },
              body: payload,
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(JSON.parse(result.body).errors).toContain(
                "Microsoft user details not provided"
              );
            });
        });
      });

      context("and the event body is empty", () => {
        it("should return 400 invalid TechRecord", async () => {
          const systemNumber = Date.now().toString();
          await LambdaTester(UpdateTechRecordsFunction)
            .event({
              path: `/vehicles/${systemNumber}`,
              pathParameters: {
                systemNumber,
              },
              body: undefined,
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(JSON.parse(result.body).errors).toContain(
                "Body is not a valid TechRecord"
              );
            });
        });
      });
    });

    context("and the path parameter systemNumber is invalid", () => {
      context("and the path parameter systemNumber is null", () => {
        it("should return 400 Invalid path parameter 'systemNumber'", async () => {
          const techRecord = cloneDeep(records[1]);
          await LambdaTester(UpdateTechRecordsFunction)
            .event({
              path: `/vehicles/${techRecord.systemNumber}`,
              body: techRecord,
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(JSON.parse(result.body).errors).toContain(
                "Invalid path parameter 'systemNumber'"
              );
            });
        });
      });
    });
  });
});

describe("updateVin", () => {
  beforeAll(async () => {
    jest.resetAllMocks();
    await emptyDatabase();
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(false);
  });
  beforeEach(async () => {
    await populateDatabase();
  });
  afterEach(async () => {
    await emptyDatabase();
  });
  afterAll(async () => {
    await emptyDatabase();
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(true);
  });

  context("when trying to update a vin", () => {
    const testVehicle = cloneDeep(
      records.find(
        (v) => v.systemNumber === "3506666" && v.vin === "XXB6703742N122212"
      )
    );
    context("and the request has incorrect parameters", () => {
      it.each([
        [
          "systemNumber is invalid",
          {
            path: `/vehicles/update-vin/${testVehicle?.systemNumber}`,
            body: {
              msUserDetails: { msOid: "userID", msUser: "Test User" },
              newVin: "SDJKHDSK89KJSBND",
            },
          },
          { errors: ["Invalid path parameter 'systemNumber'"] },
        ],
        [
          "new vin is missing",
          {
            path: `/vehicles/update-vin/${testVehicle?.systemNumber}`,
            pathParameters: {
              systemNumber: testVehicle?.systemNumber,
            },
            body: {
              msUserDetails: { msOid: "userID", msUser: "Test User" },
              newVin: "",
            },
          },
          { errors: ["New vin is invalid"] },
        ],
        [
          "new vin is the same as current vin",
          {
            path: `/vehicles/update-vin/${testVehicle?.systemNumber}`,
            pathParameters: {
              systemNumber: testVehicle?.systemNumber,
            },
            body: {
              msUserDetails: { msOid: "userID", msUser: "Test User" },
              newVin: testVehicle?.vin,
            },
          },
          { errors: ["New vin must be different to current"] },
        ],
      ])("should return 400 when %s", async (scenario, request, errors) => {
        await LambdaTester(updateVin)
          .event(request)
          .expectResolve((result: any) => {
            expect(result.statusCode).toBe(400);
            expect(result.body).toEqual(errors);
          });
      });
    });

    context("and the target record exists", () => {
      it.each([
        [
          {
            path: `/vehicles/update-vin/${testVehicle?.systemNumber}`,
            pathParameters: {
              systemNumber: testVehicle?.systemNumber,
            },
            body: {
              msUserDetails: { msOid: "userID", msUser: "Test User" },
              newVin: "DSFJHGDJSHF834JDFS",
            },
          },
          new HTTPResponse(200, HTTPRESPONSE.VIN_UPDATED),
        ],
      ])(
        "should return status code 200 VIN updated",
        async (request, response) => {
          await LambdaTester(updateVin)
            .event(request)
            .expectResolve((result: any) => {
              expect(result.statusCode).toBe(response.statusCode);
              expect(result.body).toEqual(response.body);
            });
        }
      );
    });
  });
});

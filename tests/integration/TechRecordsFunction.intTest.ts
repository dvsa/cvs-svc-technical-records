import LambdaTester from "lambda-tester";
import {getTechRecords as GetTechRecordsFunction} from "../../src/functions/getTechRecords";
import {emptyDatabase, populateDatabase} from "../util/dbOperations";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {updateTechRecords as UpdateTechRecordsFunction} from "../../src/functions/updateTechRecords";
import {postTechRecords as PostTechRecordsFunction} from "../../src/functions/postTechRecords";
import {cloneDeep} from "lodash";

describe("getTechRecords", () => {
  beforeAll(async () => {
    jest.restoreAllMocks();
    await emptyDatabase();
  });
  beforeEach(async () => {
    await populateDatabase();
  });
  afterEach(async () => {
    await emptyDatabase();
  });
  afterAll(async () => {
    await populateDatabase();
  });
  context("when the path is invalid", () => {
    it("should return 400", async () => {
      // Event has a path, but the path does not contain a Search Term
      await LambdaTester(GetTechRecordsFunction)
        .event({
          path: "test"
        })
        .expectResolve((result: any) => {
          expect(result.statusCode).toEqual(400);
          // Path checking now handled in the handler. Now only checking for Path Params
          expect(result.body).toEqual('"The search identifier should be between 3 and 21 characters."');
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
              searchIdentifier: "XMGDE02FS0H012345"
            },
            queryStringParameters: {
              status: "current"
            }
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toEqual(200);
            expect(JSON.parse(result.body).vin).toEqual("XMGDE02FS0H012345");
          });
      });
    });

    context("and the vehicle was not found", () => {
      it("should return 404", async () => {
        await LambdaTester(GetTechRecordsFunction)
          .event({
            path: "/vehicles/ABCDE02FS0H012345/tech-records",
            pathParameters: {
              searchIdentifier: "ABCDE02FS0H012345"
            }
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toEqual(404);
            expect(result.body).toEqual('"No resources match the search criteria."');
          });
      });
    });

    context("and the search identifier is lower than 3", () => {
      it("should return 400", async () => {
        await LambdaTester(GetTechRecordsFunction)
          .event({
            path: "/vehicles/XM/tech-records",
            pathParameters: {
              searchIdentifier: "XM"
            }
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toEqual(400);
            expect(result.body).toEqual('"The search identifier should be between 3 and 21 characters."');
          });
      });
    });
  });
});

describe("postTechRecords", () => {
  beforeAll(async () => {
    jest.restoreAllMocks();
    await emptyDatabase();
  });
  beforeEach(async () => {
    await populateDatabase();
  });
  afterEach(async () => {
    await emptyDatabase();
  });
  afterAll(async () => {
    await populateDatabase();
  });

  const records = require("../resources/technical-records.json");
  const techRecord: ITechRecordWrapper = records[0];

  context("when trying to create a new vehicle", () => {
    context("and the vehicle was found", () => {
      it("should return error 400", () => {
        return LambdaTester(PostTechRecordsFunction)
            .event({
              path: "/vehicles",
              body: techRecord
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(result.body).toEqual('"The conditional request failed"');
            });
      });
    });

    context("and the vehicle was not found", () => {
      it("should return 201 created", () => {
        techRecord.vin = Date.now().toString();
        techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
        techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
        return LambdaTester(PostTechRecordsFunction)
            .event({
              path: "/vehicles",
              body: techRecord
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(201);
              expect(result.body).toEqual('"Technical Record created"');
            });
      });
    });

    context("and the techRecord array is empty", () => {
      it("should return 400 invalid TechRecord", () => {
        techRecord.vin = Date.now().toString();
        techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
        techRecord.techRecord = [];
        return LambdaTester(PostTechRecordsFunction)
            .event({
              path: "/vehicles",
              body: techRecord
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(result.body).toEqual('"Body is not a valid TechRecord"');
            });
      });
    });

    context("and the event body is empty", () => {
      it("should return 400 invalid TechRecord", () => {
        techRecord.vin = Date.now().toString();
        techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
        techRecord.techRecord = [];
        return LambdaTester(PostTechRecordsFunction)
            .event({
              path: "/vehicles",
              body: undefined
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(result.body).toEqual('"Body is not a valid TechRecord"');
            });
      });
    });
  });
  beforeEach(() => {
    jest.setTimeout(5000);
  });
  afterEach(() => {
    jest.setTimeout(5000);
  });
});

describe("updateTechRecords", () => {
  beforeAll(async () => {
    jest.restoreAllMocks();
    await emptyDatabase();
  });
  beforeEach(async () => {
    await populateDatabase();
  });
  afterEach(async () => {
    await emptyDatabase();
  });
  afterAll(async () => {
    await populateDatabase();
  });

  const records = require("../resources/technical-records.json");
  const techRecord: ITechRecordWrapper = cloneDeep(records[1]);

  context("when trying to update a vehicle", () => {
    context("and the path parameter VIN is valid", () => {
      context("and the vehicle was found", () => {
        it("should return 200 and the updated vehicle", () => {
          const vin = techRecord.vin;
          delete techRecord.vin;
          techRecord.techRecord[0].bodyType.description = "updated tech record";
          techRecord.techRecord[0].grossGbWeight = 9900;
          return LambdaTester(UpdateTechRecordsFunction)
              .event({
                path: `/vehicles/${vin}`,
                pathParameters: {
                  vin
                },
                body: techRecord
              })
              .expectResolve((result: any) => {
                const updatedTechRes = JSON.parse(result.body);
                expect(result.statusCode).toEqual(200);
                expect(updatedTechRes.techRecord[0].bodyType.description).toEqual("updated tech record");
                expect(updatedTechRes.techRecord[0].grossGbWeight).toEqual(9900);
                expect(updatedTechRes).not.toHaveProperty("primaryVrm");
                expect(updatedTechRes).not.toHaveProperty("partialVin");
                expect(updatedTechRes).not.toHaveProperty("secondaryVrms");
              });
        });
      });

      context("and the vehicle was not found", () => {
        it("should return 400 Bad Request", () => {
          const vin = Date.now().toString();
          techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
          techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
          return LambdaTester(UpdateTechRecordsFunction)
              .event({
                path: `/vehicles/${vin}`,
                pathParameters: {
                  vin
                },
                body: techRecord
              })
              .expectResolve((result: any) => {
                expect(result.statusCode).toEqual(400);
                expect(result.body).toEqual('"The conditional request failed"');
              });
        });
      });

      context("and the techRecord array is empty", () => {
        it("should return 400 invalid TechRecord", () => {
          const vin = Date.now().toString();
          techRecord.partialVin = vin.substr(vin.length - 6);
          techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
          techRecord.techRecord = [];
          return LambdaTester(UpdateTechRecordsFunction)
              .event({
                path: `/vehicles/${vin}`,
                pathParameters: {
                  vin
                },
                body: techRecord
              })
              .expectResolve((result: any) => {
                expect(result.statusCode).toEqual(400);
                expect(result.body).toEqual('"Body is not a valid TechRecord"');
              });
        });
      });

      context("and the event body is empty", () => {
        it("should return 400 invalid TechRecord", () => {
          const vin = Date.now().toString();
          techRecord.partialVin = vin.substr(vin.length - 6);
          techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
          techRecord.techRecord = [];
          return LambdaTester(UpdateTechRecordsFunction)
              .event({
                path: `/vehicles/${vin}`,
                pathParameters: {
                  vin
                },
                body: undefined
              })
              .expectResolve((result: any) => {
                expect(result.statusCode).toEqual(400);
                expect(result.body).toEqual('"Body is not a valid TechRecord"');
              });
        });
      });
    });

    context("and the path parameter VIN is invalid", () => {
      context("and the path parameter VIN is null", () => {
        it("should return 400 Invalid path parameter 'vin'", () => {
          const vin = Date.now().toString();
          techRecord.partialVin = vin.substr(vin.length - 6);
          techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
          techRecord.techRecord = [];
          return LambdaTester(UpdateTechRecordsFunction)
              .event({
                path: `/vehicles/${vin}`,
                pathParameters: {
                  vin: null
                },
                body: techRecord
              })
              .expectResolve((result: any) => {
                expect(result.statusCode).toEqual(400);
                expect(result.body).toEqual('"Invalid path parameter \'vin\'"');
              });
        });
      });

      context("and the path parameter VIN is shorter than 9 characters", () => {
        it("should return 400 Invalid path parameter 'vin'", () => {
          const vin = Date.now().toString();
          techRecord.partialVin = vin.substr(vin.length - 6);
          techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
          techRecord.techRecord = [];
          return LambdaTester(UpdateTechRecordsFunction)
              .event({
                path: `/vehicles/${vin}`,
                pathParameters: {
                  vin: "ABCDEF5"
                },
                body: techRecord
              })
              .expectResolve((result: any) => {
                expect(result.statusCode).toEqual(400);
                expect(result.body).toEqual('"Invalid path parameter \'vin\'"');
              });
        });
      });

      context("and the path parameter VIN contains non alphanumeric characters", () => {
        it("should return 400 Invalid path parameter 'vin'", () => {
          const vin = Date.now().toString();
          techRecord.partialVin = vin.substr(vin.length - 6);
          techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
          techRecord.techRecord = [];
          return LambdaTester(UpdateTechRecordsFunction)
              .event({
                path: `/vehicles/${vin}`,
                pathParameters: {
                  vin: "tech-r#cord$"
                },
                body: techRecord
              })
              .expectResolve((result: any) => {
                expect(result.statusCode).toEqual(400);
                expect(result.body).toEqual('"Invalid path parameter \'vin\'"');
              });
        });
      });
    });
  });
  beforeEach(() => {
    jest.setTimeout(5000);
  });
  afterEach(() => {
    jest.setTimeout(5000);
  });
});


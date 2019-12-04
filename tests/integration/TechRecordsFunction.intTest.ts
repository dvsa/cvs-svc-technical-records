import LambdaTester from "lambda-tester";
import {getTechRecords as GetTechRecordsFunction} from "../../src/functions/getTechRecords";
import {emptyDatabase, populateDatabase} from "../util/dbOperations";
import {updateTechRecords as UpdateTechRecordsFunction} from "../../src/functions/updateTechRecords";
import {downloadDocument as DownloadDocumentFunction} from "../../src/functions/downloadDocument";
import {postTechRecords as PostTechRecordsFunction} from "../../src/functions/postTechRecords";
import records from "../resources/technical-records.json";
import {cloneDeep} from "lodash";
import {HTTPRESPONSE} from "../../src/assets/Enums";

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
              status: "current",
              metadata: "true"
            }
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toEqual(200);
            expect(JSON.parse(result.body).vin).toEqual("XMGDE02FS0H012345");
            expect(JSON.parse(result.body)).toHaveProperty("metadata");
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

  context("when trying to create a new vehicle", () => {
    context("and the vehicle was found", () => {
      it("should return error 400", async () => {
        const techRecord = cloneDeep(records[0]);

        await LambdaTester(PostTechRecordsFunction)
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
      it("should return 201 created", async () => {
        const techRecord = cloneDeep(records[0]);

        techRecord.vin = Date.now().toString();
        techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
        techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
        techRecord.trailerId = Math.floor(100000 + Math.random() * 900000).toString();

        await LambdaTester(PostTechRecordsFunction)
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
      it("should return 400 invalid TechRecord", async () => {
        const techRecord = cloneDeep(records[0]);

        techRecord.vin = Date.now().toString();
        techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
        techRecord.techRecord = [];
        await LambdaTester(PostTechRecordsFunction)
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
      it("should return 400 invalid TechRecord", async () => {
        const techRecord = cloneDeep(records[0]);

        techRecord.vin = Date.now().toString();
        techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
        techRecord.techRecord = [];
        await LambdaTester(PostTechRecordsFunction)
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

  const msUserDetails = {
    msUser: "dorel",
    msOid: "1234545"
  };

  context("when trying to update a vehicle", () => {
    context("and the path parameter VIN is valid", () => {
      context("and the vehicle was found", () => {
        it("should return 200 and the updated vehicle", async () => {
          const techRecord: any = cloneDeep(records[29]);
          const payload = {
            msUserDetails,
            techRecord: [{
              reasonForCreation: techRecord.techRecord[0].reasonForCreation,
              adrDetails: techRecord.techRecord[0].adrDetails
            }]
          };
          const vin = techRecord.vin;
          delete techRecord.vin;
          await LambdaTester(UpdateTechRecordsFunction)
            .event({
              path: `/vehicles/${vin}`,
              pathParameters: {
                vin
              },
              body: payload
            })
            .expectResolve((result: any) => {
              const updatedTechRes = JSON.parse(result.body);
              expect(result.statusCode).toEqual(200);
              expect(updatedTechRes.techRecord[techRecord.techRecord.length].statusCode).toEqual("current");
              // expect(updatedTechRes.techRecord[techRecord.techRecord.length - 1].statusCode).toEqual("archived");
            });
        });
      });

      context("and the vehicle was not found", () => {
        it("should return 404 Not found", async () => {
          const techRecord: any = cloneDeep(records[29]);
          const payload = {
            msUserDetails,
            techRecord: [{
              reasonForCreation: techRecord.techRecord[0].reasonForCreation,
              adrDetails: techRecord.techRecord[0].adrDetails
            }]
          };
          const vin = Date.now().toString();
          techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
          await LambdaTester(UpdateTechRecordsFunction)
            .event({
              path: `/vehicles/${vin}`,
              pathParameters: {
                vin
              },
              body: payload
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(404);
              expect(JSON.parse(result.body)).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
            });
        });
      });

      context("and the techRecord array is empty", () => {
        it("should return 400 invalid TechRecord", async () => {
          const techRecord = cloneDeep(records[29]);
          const payload = {
            msUserDetails,
            techRecord: []
          };
          const vin = Date.now().toString();
          techRecord.partialVin = vin.substr(vin.length - 6);
          techRecord.techRecord = [];
          await LambdaTester(UpdateTechRecordsFunction)
            .event({
              path: `/vehicles/${vin}`,
              pathParameters: {
                vin
              },
              body: payload
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(result.body).toEqual('"Body is not a valid TechRecord"');
            });
        });
      });

      context("and the msUserDetails is not provided", () => {
        it("should return 400 invalid TechRecord", async () => {
          const techRecord: any = cloneDeep(records[29]);
          const payload = {
            techRecord: [{
              reasonForCreation: techRecord.techRecord[0].reasonForCreation,
              adrDetails: techRecord.techRecord[0].adrDetails
            }]
          };
          const vin = Date.now().toString();
          techRecord.partialVin = vin.substr(vin.length - 6);
          techRecord.techRecord = [];
          await LambdaTester(UpdateTechRecordsFunction)
            .event({
              path: `/vehicles/${vin}`,
              pathParameters: {
                vin
              },
              body: payload
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(result.body).toEqual('"Microsoft user details not provided"');
            });
        });
      });

      context("and the event body is empty", () => {
        it("should return 400 invalid TechRecord", async () => {
          const vin = Date.now().toString();
          await LambdaTester(UpdateTechRecordsFunction)
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
        it("should return 400 Invalid path parameter 'vin'", async () => {
          const techRecord = cloneDeep(records[1]);

          const vin = Date.now().toString();
          techRecord.partialVin = vin.substr(vin.length - 6);
          techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
          techRecord.techRecord = [];
          await LambdaTester(UpdateTechRecordsFunction)
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
        it("should return 400 Invalid path parameter 'vin'", async () => {
          const techRecord = cloneDeep(records[1]);

          const vin = Date.now().toString();
          techRecord.partialVin = vin.substr(vin.length - 6);
          techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
          techRecord.techRecord = [];
          await LambdaTester(UpdateTechRecordsFunction)
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
        it("should return 400 Invalid path parameter 'vin'", async () => {
          const techRecord = cloneDeep(records[1]);

          const vin = Date.now().toString();
          techRecord.partialVin = vin.substr(vin.length - 6);
          techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
          techRecord.techRecord = [];
          await LambdaTester(UpdateTechRecordsFunction)
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
});

describe("downloadDocument", () => {
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

  context("when trying to download a document", () => {
    context("and the path parameters are invalid", () => {
      context("and the path parameter VIN is null", () => {
        it("should return 400 Invalid path parameter 'vin'", async () => {
          const techRecord = cloneDeep(records[1]);

          await LambdaTester(DownloadDocumentFunction)
            .event({
              path: `/vehicles/${techRecord.vin}/download-file/someFilename.pdf`,
              pathParameters: {
                vin: null,
                filename: "someFilename.pdf"
              }
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(result.body).toEqual('"Invalid path parameter \'vin\'"');
            });
        });
      });

      context("and the path parameter VIN is shorter than 9 characters", () => {
        it("should return 400 Invalid path parameter 'vin'", async () => {
          const techRecord = cloneDeep(records[1]);
          await LambdaTester(DownloadDocumentFunction)
            .event({
              path: `/vehicles/${techRecord.vin}/download-file/someFilename.pdf`,
              pathParameters: {
                vin: "ABCDEF5",
                filename: "someFilename.pdf"
              }
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(result.body).toEqual('"Invalid path parameter \'vin\'"');
            });
        });
      });

      context("and the path parameter VIN contains non alphanumeric characters", () => {
        it("should return 400 Invalid path parameter 'vin'", async () => {
          const techRecord = cloneDeep(records[1]);

          await LambdaTester(DownloadDocumentFunction)
            .event({
              path: `/vehicles/${techRecord.vin}/download-file/someFilename.pdf`,
              pathParameters: {
                vin: "tech-r#cord$",
                filename: "someFilename.pdf"
              }
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(result.body).toEqual('"Invalid path parameter \'vin\'"');
            });
        });
      });

      context("and the path parameter FILENAME is null", () => {
        it("should return 400 Invalid path parameter 'filename'", async () => {
          const techRecord = cloneDeep(records[1]);

          await LambdaTester(DownloadDocumentFunction)
            .event({
              path: `/vehicles/${techRecord.vin}/download-file/someFilename.pdf`,
              pathParameters: {
                vin: `${techRecord.vin}`,
                filename: null
              }
            })
            .expectResolve((result: any) => {
              expect(result.statusCode).toEqual(400);
              expect(result.body).toEqual('"Invalid path parameter \'filename\'"');
            });
        });
      });
    });
  });
});


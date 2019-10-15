import supertest from "supertest";

const url = "http://localhost:3005/";
const request = supertest(url);
import {populateDatabase, emptyDatabase, convertToResponse} from "../util/dbOperations";
import mockData from "../resources/technical-records.json";
import {cloneDeep} from "lodash";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";


describe("techRecords", () => {
  describe("postTechRecords", () => {
    beforeAll(async () => {
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

    context("when database is populated", () => {
      context("AC1 Vehicles API spec contains GET/POST/PUT/ verbs \
              GIVEN I am a consumer of the vehicles API \
              WHEN I call the vehicles API \
              THEN I am able to perform a PUT or POST request \
              AND I am still able to perform a GET request", () => {
        context("and when trying to create a new vehicle", () => {
          context("and the payload is valid", () => {
            context("and that vehicle does not exist", () => {
              it("should return status 201 Technical Record created", async () => {
                const newTechRec = cloneDeep(mockData[0]);
                newTechRec.vin = Date.now().toString();
                newTechRec.partialVin = newTechRec.vin.substr(newTechRec.vin.length - 6);
                newTechRec.techRecord[0].bodyType.description = "New Tech Record";
                newTechRec.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
                newTechRec.trailerId = Math.floor(100000 + Math.random() * 900000).toString();
                const res = await request.post("vehicles").send(newTechRec);
                expect(res.status).toEqual(201);
                expect(res.header["access-control-allow-origin"]).toEqual("*");
                expect(res.header["access-control-allow-credentials"]).toEqual("true");
                expect(res.body).toEqual("Technical Record created");
              });
            });

            context("and that vehicle does exist", () => {
              it("should return status 400 The conditional request failed", async () => {
                const newTechRec = cloneDeep(mockData[0]);
                const res = await request.post("vehicles").send(newTechRec);
                expect(res.status).toEqual(400);
                expect(res.header["access-control-allow-origin"]).toEqual("*");
                expect(res.header["access-control-allow-credentials"]).toEqual("true");
                expect(res.body).toEqual("The conditional request failed");
              });
            });
          });

          context("and the payload is invalid", () => {
            context("and the techRecord array is empty", () => {
              it("should return status 400 The conditional request failed", async () => {
                const newTechRec = cloneDeep(mockData[0]);
                newTechRec.techRecord = [];
                const res = await request.post("vehicles").send(newTechRec);
                expect(res.status).toEqual(400);
                expect(res.header["access-control-allow-origin"]).toEqual("*");
                expect(res.header["access-control-allow-credentials"]).toEqual("true");
                expect(res.body).toEqual("Body is not a valid TechRecord");
              });
            });
          });
        });
      });
    });
  });

  describe("updateTechRecords", () => {
    beforeAll(async () => {
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

    context("when database is populated", () => {
      context("AC1 Vehicles API spec contains GET/POST/PUT/ verbs \
              GIVEN I am a consumer of the vehicles API \
              WHEN I call the vehicles API \
              THEN I am able to perform a PUT or POST request \
              AND I am still able to perform a GET request", () => {
        context("and when trying to update a vehicle", () => {
          context("and the path parameter VIN is valid", () => {
            context("and that vehicle does exist", () => {
              it("should return status 200 and the updated vehicle", async () => {
                // @ts-ignore
                const techRec: ITechRecordWrapper = cloneDeep(mockData[1]);
                techRec.techRecord[0].bodyType.description = "Updated Tech Record";
                techRec.techRecord[0].grossGbWeight = 5678;
                const res = await request.put(`vehicles/${techRec.vin}`).send(techRec);
                expect(res.status).toEqual(200);
                expect(res.header["access-control-allow-origin"]).toEqual("*");
                expect(res.header["access-control-allow-credentials"]).toEqual("true");
                expect(res.body).toEqual(convertToResponse(techRec));
              });
            });

            context("and that vehicle does not exist", () => {
              it("should return error status 400 The conditional request failed", async () => {
                // @ts-ignore
                const techRec: ITechRecordWrapper = cloneDeep(mockData[1]);
                techRec.vin = Date.now().toString();
                techRec.partialVin = techRec.vin.substr(techRec.vin.length - 6);
                techRec.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
                techRec.techRecord[0].bodyType.description = "Updated Tech Record";
                techRec.techRecord[0].grossGbWeight = 5678;
                const res = await request.put(`vehicles/${techRec.vin}`).send(techRec);
                expect(res.status).toEqual(400);
                expect(res.header["access-control-allow-origin"]).toEqual("*");
                expect(res.header["access-control-allow-credentials"]).toEqual("true");
                expect(res.body).toEqual("The conditional request failed");
              });
            });

            context("and the techRecord array is empty", () => {
              it("should return error status 400 Body is not a valid TechRecord", async () => {
                // @ts-ignore
                const techRec: ITechRecordWrapper = cloneDeep(mockData[1]);
                techRec.techRecord = [];
                const res = await request.put(`vehicles/${techRec.vin}`).send(techRec);
                expect(res.status).toEqual(400);
                expect(res.header["access-control-allow-origin"]).toEqual("*");
                expect(res.header["access-control-allow-credentials"]).toEqual("true");
                expect(res.body).toEqual("Body is not a valid TechRecord");
              });
            });
          });

          context("and the path parameter VIN is invalid", () => {
            context("and the path parameter VIN is null", () => {
              it("should return 400 Invalid path parameter 'vin'", async () => {
                // @ts-ignore
                const techRec: ITechRecordWrapper = cloneDeep(mockData[1]);
                techRec.techRecord = [];
                const res = await request.put(`vehicles/null`).send(techRec);
                expect(res.status).toEqual(400);
                expect(res.header["access-control-allow-origin"]).toEqual("*");
                expect(res.header["access-control-allow-credentials"]).toEqual("true");
                expect(res.body).toEqual("Invalid path parameter \'vin\'");
              });
            });

            context("and the path parameter VIN is shorter than 9 characters", () => {
              it("should return 400 Invalid path parameter 'vin'", async () => {
                // @ts-ignore
                const techRec: ITechRecordWrapper = cloneDeep(mockData[1]);
                techRec.techRecord = [];
                const res = await request.put(`vehicles/ABCDEF5`).send(techRec);
                expect(res.status).toEqual(400);
                expect(res.header["access-control-allow-origin"]).toEqual("*");
                expect(res.header["access-control-allow-credentials"]).toEqual("true");
                expect(res.body).toEqual("Invalid path parameter \'vin\'");
              });
            });

            context("and the path parameter VIN contains non alphanumeric characters", () => {
              it("should return 400 Invalid path parameter 'vin'", async () => {
                // @ts-ignore
                const techRec: ITechRecordWrapper = cloneDeep(mockData[1]);
                techRec.techRecord = [];
                const res = await request.put(`vehicles/t@ch-r#cord$`).send(techRec);
                expect(res.status).toEqual(400);
                expect(res.header["access-control-allow-origin"]).toEqual("*");
                expect(res.header["access-control-allow-credentials"]).toEqual("true");
                expect(res.body).toEqual("Invalid path parameter \'vin\'");
              });
            });
          });
        });
      });
    });
  });
});

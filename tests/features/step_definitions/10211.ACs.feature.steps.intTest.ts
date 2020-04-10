import {defineFeature, loadFeature} from "jest-cucumber";
import supertest from "supertest";
import path from "path";
import mockData from "../../resources/technical-records.json";
import {emptyDatabase, populateDatabase} from "../../util/dbOperations";
import {cloneDeep} from "lodash";
import {doNotSkipAssertion} from "../../util/skipTestUtil";

const url = "http://localhost:3005/";
const request = supertest(url);

const feature = loadFeature(path.resolve(__dirname, "../10211.ACs.feature"));

defineFeature(feature, (test) => {
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

  test("AC1. PUT: Attempt to update a new vehicle without a mandatory field", ({given, when, then}) => {
    let requestUrl: string;
    let response: any;

    given("I am a consumer of the vehicles API", () => {
      requestUrl = "vehicles/ABCDEFGH654321";
    });
    when("I call the vehicles API via the PUT method without a mandatory field in the request body", async () => {
      const postPayload = createPUTPayload();
      delete postPayload.techRecord[0].manufactureYear;
      response = await request.put(requestUrl).send(postPayload);
    });
    then("I am given the 400 error code", () => {
      if(doNotSkipAssertion) {
        expect(response.status).toEqual(400);
        expect(response.body[0].message).toEqual('"manufactureYear" is required');
      }
    });
  });

  test("AC2. PUT: Attempt to update a new vehicle with a not applicable field", ({given, when, then}) => {
    let requestUrl: string;
    let response: any;

    given("I am a consumer of the vehicles API", () => {
      requestUrl = "vehicles/ABCDEFGH654321";
    });
    when('I call the vehicles API via the PUT method with at least one not applicable field (for example, a "PSV only" field, onto a HGV)', async () => {
      const postPayload = createPUTPayload();
      postPayload.techRecord[0].unladenWeight = 0;
      response = await request.put(requestUrl).send(postPayload);
    });
    then("I am given the 400 error code", () => {
      if(doNotSkipAssertion) {
        expect(response.status).toEqual(400);
        expect(response.body[0].message).toEqual('"unladenWeight" is not allowed');
      }
    });
  });

  test("AC3. PUT: Attempt to update a new vehicle with unexpected values for a field that accepts only specific values", ({given, when, then}) => {
    let requestUrl: string;
    let response: any;

    given("I am a consumer of the vehicles API", () => {
      requestUrl = "vehicles/ABCDEFGH654321";
    });
    when("I call the vehicles API via the PUT method with unexpected values for a field that accepts only specific values", async () => {
      const postPayload = createPUTPayload();
      postPayload.techRecord[0].fuelPropulsionSystem = "biscuit";
      response = await request.put(requestUrl).send(postPayload);
    });
    then("I am given the 400 error code", () => {
      if(doNotSkipAssertion) {
        expect(response.status).toEqual(400);
        expect(response.body[0].message).toEqual('"fuelPropulsionSystem" must be one of [DieselPetrol, Hybrid, Electric, CNG, Fuel cell, LNG, Other]');
      }
    });
  });

  test("AC4. PUT: Attempt to update a new vehicle, using a field which has a field value outside of the min/max length for that field", ({given, when, then}) => {
    let requestUrl: string;
    let response: any;

    given("I am a consumer of the vehicles API", () => {
      requestUrl = "vehicles/ABCDEFGH654321";
    });
    when("I call the vehicles API via the PUT method using a field which has a field value outside of the min/max length for that field", async () => {
      const postPayload = createPUTPayload();
      postPayload.techRecord[0].manufactureYear = 123456;
      response = await request.put(requestUrl).send(postPayload);
    });
    then("I am given the 400 error code", () => {
      if(doNotSkipAssertion) {
        expect(response.status).toEqual(400);
        expect(response.body[0].message).toEqual('"manufactureYear" must be less than or equal to 9999');
      }
    });
  });
});

const createPUTPayload = () => {
  const techRec: any = cloneDeep(mockData[43]);
  delete techRec.techRecord[0].statusCode;
  const payload = {
    msUserDetails: {
      msUser: "dorel",
      msOid: "1234545"
    },
    systemNumber: techRec.systemNumber,
    techRecord: techRec.techRecord
  };
  return payload;
};

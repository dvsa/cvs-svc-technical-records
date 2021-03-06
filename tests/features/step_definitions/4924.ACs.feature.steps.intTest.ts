import { convertToResponse } from "./../../util/dbOperations";
import { defineFeature, loadFeature } from "jest-cucumber";
import supertest from "supertest";
import path from "path";
import { emptyDatabase, populateDatabase } from "../../util/dbOperations";
import mockData from "../../resources/technical-records.json";
import { cloneDeep } from "lodash";
import ITechRecord from "../../../@Types/ITechRecord";

const url = "http://localhost:3005/";
const request = supertest(url);
const feature = loadFeature(path.resolve(__dirname, "../4924.ACs.feature"));

defineFeature(feature, ( test ) => {
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

  test("AC1 API Consumer retrieve the Vehicle Technical Records", ({ given, when, then, and }) => {
    let requestUrl: string;
    let response: any;
    let expectedResponse: any;

    given("I am an API Consumer", () => {
      requestUrl = "vehicles/ABCDEFGH777777/tech-records";
    });
    when("I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records", async () => {
      response = await request.get(requestUrl);
    });
    and("there is a vehicle that can be identified by the value provided for the searchIdentifier", () => {
      expectedResponse = convertToResponse(cloneDeep(mockData[29]));
    });
    then("the system returns a body message containing a single CompleteTechRecord", () => {
      expect(expectedResponse).toEqual(response.body);
      const techRecord: ITechRecord[] = response.body[0].techRecord;
      expect(techRecord[0].adrDetails).toBeTruthy();
    });
    and("the system returns an HTTP status code 200 OK", () => {
      expect(response.status).toEqual(200);
    });
  });

  test("AC2 No data returned", ({ given, when, then, and }) => {
    let requestUrl: string;
    let response: any;
    given("I am an API Consumer", () => {
      requestUrl = "vehicles/T72745555/tech-records";
    });
    when("I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records", async () => {
      response = await request.get(requestUrl);
    });
    // tslint:disable-next-line: no-empty
    and("no data is found", () => {});
    then("the system returns an HTTP status code 404", () => {
      expect(response.status).toEqual(404);
    });
  });
});

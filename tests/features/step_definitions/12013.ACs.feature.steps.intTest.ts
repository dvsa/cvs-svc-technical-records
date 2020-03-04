import {defineFeature, loadFeature} from "jest-cucumber";
import supertest from "supertest";
import path from "path";
import mockData from "../../resources/technical-records.json";
import mockContext from "aws-lambda-mock-context";
import {emptyDatabase, populateDatabase, convertToResponse} from "../../util/dbOperations";
import {cloneDeep} from "lodash";

const url = "http://localhost:3005/";
const request = supertest(url);
const opts = Object.assign({
  timeout: 1.5
});

const feature = loadFeature(path.resolve(__dirname, "../12013.ACs.feature"));

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

  test("AC2 BE API consumer performs a GET call for tech records microservice", ({ given, when, then, and }) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;
    let expectedResponse: any;
    const VIN = "YV31ME00000 1/\\*-1";
    let searchIdentifier: string;

    given("I am an API Consumer", () => {
      requestUrl = "vehicles/";
    });
    and("the searchIdentifier was URL encoded as per AC1", () => {
      searchIdentifier = encodeURIComponent(VIN);
    });
    when("I send a GET request to /vehicles/[searchIdentifier]/tech-records", async () => {
      response = await request.get(requestUrl + searchIdentifier + "/tech-records");
    });
    then("the searchIdentifier value is URL decoded before making the search in the DB", () => {
      expectedResponse = convertToResponse(cloneDeep(mockData[85]));
      expect(expectedResponse).toEqual(response.body);
      expect(response.status).toEqual(200);
    });
    and("the search is performed using the decoded value of the searchIdentifier", () => {
      expect(response.body[0].vin).toEqual(VIN);
    });
    ctx.succeed("done");
    ctx = null;
  });
});
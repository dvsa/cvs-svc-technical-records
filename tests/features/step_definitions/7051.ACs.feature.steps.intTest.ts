import {defineFeature, loadFeature} from "jest-cucumber";
import supertest from "supertest";
import path from "path";
import {convertTo7051Response, emptyDatabase, populateDatabase} from "../../util/dbOperations";
import mockData from "../../resources/technical-records.json";
import * as _ from "lodash";

const url = "http://localhost:3005/";
const request = supertest(url);
const feature = loadFeature(path.resolve(__dirname, "../7051.ACs.feature"));

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

  test("AC1.1 API Consumer retrieve the Vehicle Technical Records for - " +
    'query parameter "status" not provided & vehicle has both "current" and "provisional" technical records', ({given, when, then, and}) => {
    let requestUrl: string;
    let response: any;
    let expectedResponse: any;
    given("I am an API Consumer", () => {
      requestUrl = "vehicles/YV31MEC18GA011911/tech-records";
    });
    when("I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records", async () => {
      response = await request.get(requestUrl);
    });
    and('for the identified vehicle in the database there is a Technical Record with the "statusCode" = "current"', () => {
      const isStatusPresent = isStatusCodePresent(mockData[9], "current");
      expect(isStatusPresent).toBe(true);
    });
    and('for the identified vehicle in the database there is a Technical Record with the "statusCode" = "provisional"', () => {
      const isStatusPresent = isStatusCodePresent(mockData[9], "provisional");
      expect(isStatusPresent).toBe(true);
    });
    then('for the query parameter "status", the default value "provisional_over_current" will be taken into account', () => {
      expectedResponse = convertTo7051Response(_.cloneDeep(mockData[9]), 1);
    });
    and("the system returns a body message containing a single CompleteTechRecord", () => {
      expect(expectedResponse).toEqual(response.body);
    });
    and('the statusCode of the Technical Records "provisional"', () => {
      const isStatusPresent = isStatusCodePresent(response.body, "provisional");
      expect(isStatusPresent).toBe(true);
    });
    and("the system returns an HTTP status code 200 OK", () => {
      expect(response.status).toEqual(200);
    });
  });

  test("AC1.2 API Consumer retrieve the Vehicle Technical Records for - " +
    'query parameter "status" not provided & vehicle has only one "current" OR "provisional" technical record', ({given, when, then, and}) => {
    let requestUrl: string;
    let response: any;
    let expectedResponse: any;
    given("I am an API Consumer", () => {
      requestUrl = "vehicles/021430/tech-records";
    });
    when("I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records", async () => {
      response = await request.get(requestUrl);
    });
    and('the query parameter "status" is not provided', () => {
    });
    and('for the identified vehicle in the database there is only one "current" OR "provisional" Technical Record - not both of them at the same time', () => {
      const isProvisional = isStatusCodePresent(mockData[3], "provisional");
      const isCurrent = isStatusCodePresent(mockData[3], "current");
      expect((isProvisional || isCurrent)).toBe(true);
      expect((isProvisional && isCurrent)).toBe(false);
    });
    then('for the query parameter "status", the default value "provisional_over_current" will be taken into account', () => {
      expectedResponse = convertTo7051Response(_.cloneDeep(mockData[3]), 0);
    });
    and("the system returns a body message containing a single CompleteTechRecord", () => {
      expect(expectedResponse).toEqual(response.body);
    });
    and('the specific Technical Record found in database is returned - "current" or "provisional" as it is in the database', () => {
      const isProvisional = isStatusCodePresent(response.body, "provisional");
      const isCurrent = isStatusCodePresent(response.body, "current");
      expect((isProvisional || isCurrent)).toBe(true);
    });
    and("the system returns an HTTP status code 200 OK", () => {
      expect(response.status).toEqual(200);
    });
  });

  test("AC2.1 API Consumer retrieve the Vehicle Technical Records for - " +
    'query parameter "status" is "provisional_over_current" & vehicle has both "current" and "provisional" technical records', ({given, when, then, and}) => {
    let requestUrl: string;
    let response: any;
    let expectedResponse: any;
    given("I am an API Consumer", () => {
      requestUrl = "vehicles/CT70HHH/tech-records?";
    });
    when("I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records?status=provisional_over_current", async () => {
      const status = "status=provisional_over_current";
      requestUrl += status;
      response = await request.get(requestUrl);
    });
    and('the query parameter "status" is "provisional_over_current"', () => {
    });
    and('for the identified vehicle in the database there is a Technical Record with the "statusCode" = "current"', () => {
      const isCurrent = isStatusCodePresent(mockData[27], "current");
      expect(isCurrent).toBe(true);
    });
    and('for the identified vehicle in the database there is a Technical Record with the "statusCode" = "provisional"', () => {
      const isProvisional = isStatusCodePresent(mockData[27], "provisional");
      expect(isProvisional).toBe(true);
    });
    then("the system returns a body message containing a single CompleteTechRecord", () => {
      expectedResponse = convertTo7051Response(_.cloneDeep(mockData[27]), 0);
      expect(expectedResponse).toEqual(response.body);
    });
    and('the statusCode of the Technical Records "provisional"', () => {
      const isProvisional = isStatusCodePresent(response.body, "provisional");
      expect(isProvisional).toBe(true);
    });
    and("the system returns an HTTP status code 200 OK", () => {
      expect(response.status).toEqual(200);
    });
  });

  test("AC2.2 API Consumer retrieve the Vehicle Technical Records for - " +
    'query parameter "status" is "provisional_over_current" & vehicle has only one "current" OR "provisional" technical record', ({given, when, then, and}) => {
    let requestUrl: string;
    let response: any;
    let expectedResponse: any;
    given("I am an API Consumer", () => {
      requestUrl = "vehicles/T72741234/tech-records?";
    });
    when("I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records?status=provisional_over_current", async () => {
      const status = "status=provisional_over_current";
      requestUrl += status;
      response = await request.get(requestUrl);
    });
    and('the query parameter "status" is "provisional_over_current"', () => {
    });
    and('for the identified vehicle in the database there is only one "current" OR "provisional" Technical Record - not both of them at the same time', () => {
      const isProvisional = isStatusCodePresent(mockData[25], "provisional");
      const isCurrent = isStatusCodePresent(mockData[25], "current");
      expect((isProvisional || isCurrent)).toBe(true);
      expect((isProvisional && isCurrent)).toBe(false);
    });
    then("the system returns a body message containing a single CompleteTechRecord", () => {
      expectedResponse = convertTo7051Response(_.cloneDeep(mockData[25]), 0);
      expect(expectedResponse).toEqual(response.body);
    });
    and('the specific Technical Record found in database is returned - "current" or "provisional" as it is in the database', () => {
      const isProvisional = isStatusCodePresent(response.body, "provisional");
      const isCurrent = isStatusCodePresent(response.body, "current");
      expect((isProvisional || isCurrent)).toBe(true);
    });
    and("the system returns an HTTP status code 200 OK", () => {
      expect(response.status).toEqual(200);
    });
  });

  test("AC3 No data returned", ({given, when, then, and}) => {
    let requestUrl: string;
    let response: any;
    given("I am an API Consumer", () => {
      requestUrl = "vehicles/T72745555/tech-records?status=provisional_over_current";
    });
    when("I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records", async () => {
      response = await request.get(requestUrl);
    });
    and("no data is found", () => { return; });
    then("the system returns an HTTP status code 404", () => {
      expect(response.status).toEqual(404);
    });
  });

  // test("AC4 Multiple results returned", ({given, when, then, and}) => {
  //
  //   let requestUrl: string;
  //   let response: any;
  //   const partialVin = "678413";
  //   given("I am an API Consumer", () => {
  //     requestUrl = "vehicles/" + partialVin + "/tech-records";
  //   });
  //   when("I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records", async () => {
  //     response = await request.get(requestUrl);
  //   });
  //   and("multiple results found (more than one CompleteTechRecord object is returned)", () => {
  //     expect(mockData.filter(( entry ) => entry.partialVin === partialVin ).length > 1).toBeTruthy();
  //   });
  //   then("the system returns an HTTP status code 422", () => {
  //     expect(response.status).toEqual(422);
  //   });
  // });
});

const isStatusCodePresent = (completeTechRecord: any, status: string) => {
  // tslint:disable-next-line:no-shadowed-variable
  let isStatusPresent = false;
  if(completeTechRecord instanceof Array) {
    completeTechRecord = completeTechRecord[0];
  }
  completeTechRecord.techRecord.forEach((record: any) => {
    if (record.statusCode === status) {
      isStatusPresent = true;
    }
  });
  return isStatusPresent;
};

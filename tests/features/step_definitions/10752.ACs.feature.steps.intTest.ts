import {defineFeature, loadFeature} from "jest-cucumber";
import supertest from "supertest";
import path from "path";

const url = "http://localhost:3005/";
const request = supertest(url);
import {convertToResponse, emptyDatabase, populateDatabase} from "../../util/dbOperations";
import mockData from "../../resources/technical-records.json";
import mockContext from "aws-lambda-mock-context";
import ITechRecordWrapper from "../../../@Types/ITechRecordWrapper";

const opts = Object.assign({
  timeout: 1
});
const feature = loadFeature(path.resolve(__dirname, "../10752.ACs.feature"));

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

  test("AC1 API Consumer retrieve the Vehicle Technical Records", ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;
    let responseBody: ITechRecordWrapper[];

    const vin = "XMGDE02FS0H012345";

    given("I am an API Consumer", () => {
      requestUrl = "vehicles/"+ vin +"/tech-records";
    });
    when("I send a request to AWS_CVS_DOMAIN/vehicles/[searchIdentifier]/tech-records", async () => {
      response = await request.get(requestUrl);
      responseBody = response.body;
    });
    and("there is at least one vehicle that can be identified by the value provided for the searchIdentifier", () => {
      expect(mockData[0].vin).toEqual(vin);
    });
    then("the system returns a body message containing an array of completeTechRecords", () => {
      expect(responseBody instanceof Array).toBe(true);
      expect(responseBody).toEqual(convertToResponse(mockData[0]));
      expect(responseBody[0].systemNumber).toEqual(mockData[0].systemNumber);
      expect(responseBody[0].techRecord).toEqual(mockData[0].techRecord);
    });
    and("the systemNumber attribute is present for each vehicle tech record retrieved, at completeTechRecord level", () => {
      (responseBody).forEach(( record: ITechRecordWrapper ) => {
        expect(record.systemNumber).toBeTruthy();
      });
    });
    and("the system returns an HTTP status code 200 OK", () => {
      expect(response.status).toEqual(200);
    });
    ctx.succeed("done");
    ctx = null;
  });

  test("AC2 No data returned", ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;

    const vin = "XMGDE02FS0H01234J";

    given("I am an API Consumer", () => {
      requestUrl = "vehicles/"+ vin +"/tech-records";
    });
    when("I send a request to AWS_CVS_DOMAIN/vehicles/[searchIdentifier]/tech-records", async () => {
      response = await request.get(requestUrl);
    });
    and("no data is found", () => {
      mockData.forEach(( record ) => {
        expect(record.vin === vin).toBeFalsy();
      });
    });
    then("the system returns an HTTP status code 404", () => {
      expect(response.status).toEqual(404);
    });
    ctx.succeed("done");
    ctx = null;
  });

});

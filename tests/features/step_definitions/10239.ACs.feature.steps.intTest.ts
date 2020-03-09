import {defineFeature, loadFeature} from "jest-cucumber";
import supertest from "supertest";
import path from "path";
import mockData from "../../resources/technical-records.json";
import mockContext from "aws-lambda-mock-context";
import {emptyDatabase, populateDatabase} from "../../util/dbOperations";
import {cloneDeep} from "lodash";

const url = "http://localhost:3005/";
const request = supertest(url);
const opts = Object.assign({
  timeout: 1.5
});

const feature = loadFeature(path.resolve(__dirname, "../10239.ACs.feature"));

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

  test("AC1. GET request: All attributes applicable to PSVs are returned", ({given, when, then}) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;

    given("I am the vehicles backend service", () => {
      requestUrl = "vehicles/ABCDEPSV000666/tech-records?status=current";
    });
    when("I am called for a PSV, via the GET verb", async () => {
      response = await request.get(requestUrl);
    });
    then("I return all the attributes applicable to PSV, from the linked excel", () => {
      expect(response.status).toEqual(200);
      expect(response.body[0].techRecord[0].statusCode).toEqual("current");
      expect(response.body[0].techRecord[0]).toHaveProperty("numberOfWheelsDriven");
      expect(response.body[0].techRecord[0].brakes).toHaveProperty("brakeCode");
      expect(response.body[0].techRecord[0].brakes).toHaveProperty("dataTrBrakeOne");
      expect(response.body[0].techRecord[0]).toHaveProperty("dda");
      expect(response.body[0].techRecord[0].dda).toHaveProperty("certificateIssued");
      expect(response.body[0].techRecord[0]).toHaveProperty("numberOfSeatbelts");
      expect(response.body[0].techRecord[0]).toHaveProperty("seatbeltInstallationApprovalDate");

    });
    ctx.succeed("done");
    ctx = null;
  });

  test("POST request: PSV vehicle is created, and the appropriate attributes are automatically set", ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;
    let responseGET: any;
    let postPayload: any;

    given("I am the vehicles backend service", () => {
      requestUrl = "vehicles";
    });
    when("a new PSV vehicle is created via the POST verb", async () => {
      postPayload = createPOSTPayload();
      response = await request.post(requestUrl).send(postPayload);
    });
    then("my POST action adheres to the PSV validations, present in the linked excel, columns D-E", () => {
      expect(response.status).toEqual(201);
    });
    and("the appropriate audit attributes are set on this new tech record", async () => {
      responseGET = await request.get(requestUrl + `/${postPayload.vin}/tech-records`);
      expect(responseGET.body[0].techRecord[0]).toHaveProperty("createdAt");
      expect(responseGET.body[0].techRecord[0]).toHaveProperty("createdByName");
      expect(responseGET.body[0].techRecord[0]).toHaveProperty("createdById");
    });
    and("the 'statusCode' of this new tech record is always 'provisional'", () => {
      expect(responseGET.body[0].techRecord[0].statusCode).toEqual("provisional");
    });
    and("I am able to POST attributes residing anywhere on the vehicle object", () => {
      expect(responseGET.body[0].techRecord[0].numberOfSeatbelts).toEqual("26");
      expect(responseGET.body[0].vrms[0].vrm).toEqual("BLMN906");
      expect(responseGET.body[0].vrms[0].isPrimary).toEqual(true);
    });
    ctx.succeed("done");
    ctx = null;
  });
});

const createPOSTPayload = () => {
  const techRec: any = cloneDeep(mockData[74]);
  delete techRec.techRecord[0].statusCode;
  techRec.techRecord[0].numberOfSeatbelts = "26";
  const payload = {
    msUserDetails: {
      msUser: "dorel",
      msOid: "1234545"
    },
    vin: Date.now().toString(),
    primaryVrm: "BLMN906",
    techRecord: techRec.techRecord
  };
  return payload;
};

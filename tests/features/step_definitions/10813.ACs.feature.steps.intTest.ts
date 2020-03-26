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

const feature = loadFeature(path.resolve(__dirname, "../10813.ACs.feature"));

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

  test("AC1. PUT request: PSV vehicle is updated, and the appropriate attributes are automatically set", ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;
    let responseGET: any;
    let requestUrlGET: string;

    given("I am the vehicles backend service", () => {
      requestUrl = "vehicles/9999999";
      requestUrlGET = "vehicles/ABCDEPSV000666/tech-records?status=all";
    });
    when("an existing PSV vehicle is updated via the PUT verb", async () => {
      const putPayload = createPUTPayload();
      putPayload.techRecord[0].numberOfSeatbelts = "33";
      response = await request.put(requestUrl).send(putPayload);
      responseGET = await request.get(requestUrlGET);
    });
    then("my PUT action adheres to the PSV validations, present in the linked excel, columns D-E", () => {
      expect(response.status).toEqual(200);
      expect(response.body.techRecord.length).toEqual(2);
    });
    and("a new identical tech record is created, with the same status, and the updated attributes on it", () => {
      expect(response.body.techRecord[1].statusCode).toEqual("current");
      expect(response.body.techRecord[1].numberOfSeatbelts).toEqual("33");
    });
    and('the previous "pre-update" tech record still exists in DynamoDB, with it\'s status set to archived', () => {
      expect(response.body.techRecord[0].statusCode).toEqual("archived");
    });
    and("the appropriate audit attributes are set on the new updated tech record", () => {
      expect(responseGET.body[0].techRecord[1]).toHaveProperty("createdAt");
      expect(responseGET.body[0].techRecord[1]).toHaveProperty("createdByName");
      expect(responseGET.body[0].techRecord[1]).toHaveProperty("createdById");
    });
    and("the appropriate audit attributes are set on the \"pre-update\" tech record (lastUpdatedByName, lastUpdatedByID, lastUpdatedAt, updateType: techRecordUpdate)", () => {
      expect(responseGET.body[0].techRecord[0]).toHaveProperty("lastUpdatedByName");
      expect(responseGET.body[0].techRecord[0]).toHaveProperty("lastUpdatedById");
      expect(responseGET.body[0].techRecord[0]).toHaveProperty("lastUpdatedAt");
      expect(responseGET.body[0].techRecord[0]).toHaveProperty("updateType");
      expect(responseGET.body[0].techRecord[0].updateType).toEqual("techRecordUpdate");
    });
    and("I am only able to update attributes within the techRecord[] array", () => {
      expect(response.body.vrms.length).toEqual(2);
      expect(response.body.vrms[0].vrm).toEqual("MK99OIF");
      expect(response.body.vrms[0].isPrimary).toEqual(true);
      expect(response.body.vrms[1].vrm).toEqual("876543D");
      expect(response.body.vrms[1].isPrimary).toEqual(false);
    });
    ctx.succeed("done");
    ctx = null;
  });
});

const createPUTPayload = () => {
  const techRec: any = cloneDeep(mockData[74]);
  const payload = {
    msUserDetails: {
      msUser: "dorel",
      msOid: "1234545"
    },
    techRecord: techRec.techRecord
  };
  return payload;
};

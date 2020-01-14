import {defineFeature, loadFeature} from "jest-cucumber";
import supertest from "supertest";
import path from "path";
import mockData from "../../resources/technical-records.json";
import mockContext from "aws-lambda-mock-context";
import {emptyDatabase, populateDatabase} from "../../util/dbOperations";
import {UPDATE_TYPE} from "../../../src/assets/Enums";
import {validatePayload} from "../../../src/utils/PayloadValidation";
import {cloneDeep} from "lodash";

const url = "http://localhost:3005/";
const request = supertest(url);
const opts = Object.assign({
  timeout: 1.5
});

const feature = loadFeature(path.resolve(__dirname, "../8677.ACs.feature"));

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

  test("AC1. PUT: Add adrDetails{} object onto an existing tech record", ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;

    given("I am a consumer of the vehicles API", () => {
      requestUrl = "vehicles/P012301270123";
    });
    when("I call the vehicles API via the PUT method", async () => {
      const putPayload = createPUTPayload();
      response = await request.put(requestUrl).send(putPayload);
    });
    then("I am able to create a new identical tech record with the adrDetails{} object on it", () => {
      expect(response.status).toEqual(200);
      expect(response.body.techRecord[1].statusCode).toEqual("provisional");
      expect(response.body.techRecord[1]).toHaveProperty("adrDetails");
    });
    and("the existing tech record is archived", () => {
      expect(response.body.techRecord[0].reasonForCreation).toEqual("new trailer");
      expect(response.body.techRecord[0].statusCode).toEqual("archived");
    });
    and("my PUT action adheres to the adrDetails{} API validations, present in the attached updated API spec", () => {
      expect(response.body.techRecord[1].reasonForCreation).toEqual("adr update");
      expect(response.body.techRecord[0].updateType).toEqual(UPDATE_TYPE.ADR);
    });
    ctx.succeed("done");
    ctx = null;
  });

  test("AC2. PUT: Update adrDetails{} object on an existing tech record", ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;

    given("I am a consumer of the vehicles API", () => {
      requestUrl = "vehicles/ABCDEFGH654321";
    });
    when("I call the vehicles API via the PUT method", async () => {
      const putPayload = createPUTPayload();
      putPayload.techRecord[0].adrDetails.additionalExaminerNotes = "new notes";
      response = await request.put(requestUrl).send(putPayload);
    });
    then("I am able to create a new identical tech record with the updated adrDetails{} object on it", () => {
      expect(response.status).toEqual(200);
      expect(response.body.techRecord[1].statusCode).toEqual("provisional");
      expect(response.body.techRecord[1]).toHaveProperty("adrDetails");
      expect(response.body.techRecord[1].adrDetails.additionalExaminerNotes).toEqual("new notes");
    });
    and("the existing tech record (with the 'old' adrDetails{} object on it) is archived", () => {
      expect(response.body.techRecord[0]).toHaveProperty("adrDetails");
      expect(response.body.techRecord[0].statusCode).toEqual("archived");
    });
    and("my PUT action adheres to the adrDetails{} API validations, present in the attached updated API spec", () => {
      expect(response.body.techRecord[1].reasonForCreation).toEqual("adr update");
      expect(response.body.techRecord[0].updateType).toEqual(UPDATE_TYPE.ADR);
    });
    ctx.succeed("done");
    ctx = null;
  });

  test("AC3. GET: All attributes are returned", ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;
    let responseGET: any;
    let requestUrlGET: string;

    given("I am a consumer of the vehicles API", () => {
      requestUrl = "vehicles/ABCDEFGH654321";
      requestUrlGET = "vehicles/ABCDEFGH654321/tech-records?status=all";
    });
    when("I call the vehicles API via the GET method", async () => {
      const putPayload = createPUTPayload();
      putPayload.techRecord[0].adrDetails.additionalExaminerNotes = "new notes";
      response = await request.put(requestUrl).send(putPayload);
      responseGET = await request.get(requestUrl);
    });
    then("the JSON response contains the entire vehicle object", () => {
      expect(response.status).toEqual(200);
      expect(response.body.techRecord.length).toEqual(2);
    });
    and("this JSON response contains the adrDetails{} object", () => {
      expect(response.body.techRecord[0]).toHaveProperty("adrDetails");
      expect(response.body.techRecord[1]).toHaveProperty("adrDetails");
    });
    and("the adrDetails{} object contains all the attributes from both CVSB-8464 + CVSB-8714", () => {
      delete response.body.techRecord[1].createdByName;
      delete response.body.techRecord[1].createdAt;
      delete response.body.techRecord[1].createdById;
      delete response.body.techRecord[1].statusCode;
      const isAdrValid = validatePayload(response.body.techRecord[1]);
      expect(isAdrValid).not.toHaveProperty("error");
    });
    ctx.succeed("done");
    ctx = null;
  });

  test("AC4. Adding of adrDetails{} is audited", ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;

    given("I am a consumer of the vehicles API", () => {
      requestUrl = "vehicles/P012301270123";
    });
    when("I add adrDetails{} as per AC1 above", async () => {
      const putPayload = createPUTPayload();
      response = await request.put(requestUrl).send(putPayload);
    });
    then('the following attributes are also set on my "new identical new tech record with the adrDetails{} on it', () => {
      /*
        createdAt: Date + time of this action
        createdByName: Microsoft AD username, of the person who performed this action
        createdById: Microsoft AD OID, of the person who performed this action
       */
      expect(response.status).toEqual(200);
      expect(response.body.techRecord[1].statusCode).toEqual("provisional");
      expect(response.body.techRecord[1].createdAt).toBeDefined();
      expect(response.body.techRecord[1].createdByName).toBeDefined();
      expect(response.body.techRecord[1].createdById).toBeDefined();
    });
    and('the following attributes are also set on my "existing tech record (without the adrDetails{} object on it)" (which got archived in AC1)', () => {
      /*
        lastUpdatedAt: Date + time of this action
        lastUpdatedByName: Microsoft AD username, of the person who performed this action
        lastUpdatedById: Microsoft AD OID, of the person who performed this action
        updateType: adrUpdate
       */
      expect(response.body.techRecord[0].statusCode).toEqual("archived");
      expect(response.body.techRecord[0].lastUpdatedAt).toBeDefined();
      expect(response.body.techRecord[0].lastUpdatedByName).toBeDefined();
      expect(response.body.techRecord[0].lastUpdatedById).toBeDefined();
      expect(response.body.techRecord[0].updateType).toBeDefined();
    });
    ctx.succeed("done");
    ctx = null;
  });

  test("AC5. Adding of adrDetails{} is audited", ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;

    given("I am a consumer of the vehicles API", () => {
      requestUrl = "vehicles/ABCDEFGH654321";
    });
    when("I update adrDetails{} as per AC2 above", async () => {
      const putPayload = createPUTPayload();
      response = await request.put(requestUrl).send(putPayload);
    });
    then('the following attributes are also set on my "new identical tech record with the updated adrDetails{} on it', () => {
      /*
        createdAt: Date + time of this action
        createdByName: Microsoft AD username, of the person who performed this action
        createdById: Microsoft AD OID, of the person who performed this action
       */
      expect(response.status).toEqual(200);
      expect(response.body.techRecord[1].statusCode).toEqual("provisional");
      expect(response.body.techRecord[1].createdAt).toBeDefined();
      expect(response.body.techRecord[1].createdByName).toBeDefined();
      expect(response.body.techRecord[1].createdById).toBeDefined();
    });
    and('the following attributes are also set on my "existing tech record (with the \'old\' adrDetails{} object on it)" (which got archived in AC2)', () => {
      /*
        lastUpdatedAt: Date + time of this action
        lastUpdatedByName: Microsoft AD username, of the person who performed this action
        lastUpdatedById: Microsoft AD OID, of the person who performed this action
        updateType: adrUpdate
       */
      expect(response.body.techRecord[0].statusCode).toEqual("archived");
      expect(response.body.techRecord[0].lastUpdatedAt).toBeDefined();
      expect(response.body.techRecord[0].lastUpdatedByName).toBeDefined();
      expect(response.body.techRecord[0].lastUpdatedById).toBeDefined();
      expect(response.body.techRecord[0].updateType).toBeDefined();
    });
    ctx.succeed("done");
    ctx = null;
  });
});

const createPUTPayload = () => {
  const techRec: any = cloneDeep(mockData[43]);
  techRec.techRecord[0].reasonForCreation = "adr update";
  delete techRec.techRecord[0].statusCode;
  const payload = {
    msUserDetails: {
      msUser: "dorel",
      msOid: "1234545"
    },
    systemNumber: "10000030",
    techRecord: techRec.techRecord
  };
  return payload;
};

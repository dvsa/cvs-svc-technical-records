import {defineFeature, loadFeature} from 'jest-cucumber';
import supertest from "supertest";
import path from 'path';
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

const feature = loadFeature(path.resolve(__dirname, "../10209.ACs.feature"));

defineFeature(feature, test => {
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

  test('AC1. GET request: All attributes applicable to HGVs are returned', ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;

    given('I am the vehicles backend service', () => {
      requestUrl = 'vehicles/ABCDEFGH654321/tech-records';
    });
    when('I am called for a HGV, via the GET verb', async () => {
      response = await request.get(requestUrl);
    });
    then('I return all the attributes applicable to HGV, from the linked excel', () => {
      expect(response.status).toEqual(200);
      expect(response.body.techRecord[0].statusCode).toEqual("provisional");
      expect(response.body.techRecord[0]).toHaveProperty("grossEecWeight");
      expect(response.body.techRecord[0]).toHaveProperty("dtpNumber");
      expect(response.body.techRecord[0]).toHaveProperty("make");
      expect(response.body.techRecord[0]).toHaveProperty("model");

    });
    ctx.succeed('done');
    ctx = null;
  });

  test('POST request: HGV vehicle is created, and the appropriate attributes are automatically set', ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrl: string;
    let response: any;
    let responseGET: any;
    let postPayload: any;

    given('I am the vehicles backend service', () => {
      requestUrl = 'vehicles';
    });
    when('a new HGV vehicle is created via the POST verb', async () => {
      postPayload = createPOSTPayload();
      response = await request.post(requestUrl).send(postPayload);
    });
    then('my POST action adheres to the HGV validations, present in the linked excel, columns D-E', () => {
      expect(response.status).toEqual(201);
    });
    and('the appropriate audit attributes are set on this new tech record', async () => {
      responseGET = await request.get(requestUrl + `/${postPayload.vin}/tech-records`);
      expect(responseGET.body.techRecord[0]).toHaveProperty("createdAt");
      expect(responseGET.body.techRecord[0]).toHaveProperty("createdByName");
      expect(responseGET.body.techRecord[0]).toHaveProperty("createdById");
    });
    and('the \'statusCode\' of this new tech record is always \'provisional\'', () => {
      expect(responseGET.body.techRecord[0].statusCode).toEqual("provisional");
    });
    and('I am able to POST attributes residing anywhere on the vehicle object', () => {
      expect(responseGET.body.techRecord[0].grossEecWeight).toEqual(22);
      expect(responseGET.body.vrms[0].vrm).toEqual("ALKH567");
      expect(responseGET.body.vrms[0].isPrimary).toEqual(true);
    });
    ctx.succeed('done');
    ctx = null;
  });

  // test('PUT request: HGV vehicle is updated, and the appropriate attributes are automatically set', ({given, when, then, and}) => {
  //   let ctx: any = mockContext(opts);
  //
  //   let requestUrl: string;
  //   let response: any;
  //   let responseGET: any;
  //   let requestUrlGET: string;
  //
  //   given('I am a consumer of the vehicles API', () => {
  //     requestUrl = 'vehicles/ABCDEFGH654321';
  //     requestUrlGET = 'vehicles/ABCDEFGH654321/tech-records?status=all';
  //   });
  //   when('I call the vehicles API via the GET method', async () => {
  //     const putPayload = createPUTPayload();
  //     putPayload.techRecord[0].adrDetails.additionalExaminerNotes = "new notes";
  //     response = await request.put(requestUrl).send(putPayload);
  //     responseGET = await request.get(requestUrl);
  //   });
  //   then('the JSON response contains the entire vehicle object', () => {
  //     expect(response.status).toEqual(200);
  //     expect(response.body.techRecord.length).toEqual(2);
  //   });
  //   and('this JSON response contains the adrDetails{} object', () => {
  //     expect(response.body.techRecord[0]).toHaveProperty("adrDetails");
  //     expect(response.body.techRecord[1]).toHaveProperty("adrDetails");
  //   });
  //   and('the adrDetails{} object contains all the attributes from both CVSB-8464 + CVSB-8714', () => {
  //     delete response.body.techRecord[1].createdByName;
  //     delete response.body.techRecord[1].createdAt;
  //     delete response.body.techRecord[1].createdById;
  //     delete response.body.techRecord[1].statusCode;
  //     const isAdrValid = validatePayload(response.body.techRecord[1]);
  //     expect(isAdrValid).not.toHaveProperty("error");
  //   });
  //   ctx.succeed('done');
  //   ctx = null;
  // });
});

const createPUTPayload = () => {
  const techRec: any = cloneDeep(mockData[43]);
  delete techRec.techRecord[0].statusCode;
  const payload = {
    msUserDetails: {
      msUser: "dorel",
      msOid: "1234545"
    },
    techRecord: techRec.techRecord
  };
  return payload;
};

const createPOSTPayload = () => {
  const techRec: any = cloneDeep(mockData[43]);
  techRec.techRecord[0].grossEecWeight = 22;
  delete techRec.techRecord[0].statusCode;
  const payload = {
    msUserDetails: {
      msUser: "dorel",
      msOid: "1234545"
    },
    vin: Date.now().toString(),
    primaryVrm: "ALKH567",
    techRecord: techRec.techRecord
  };
  return payload;
};

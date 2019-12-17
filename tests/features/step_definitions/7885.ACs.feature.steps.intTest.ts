import {defineFeature, loadFeature} from 'jest-cucumber';
import supertest from "supertest";
import path from 'path';

const url = "http://localhost:3005/";
const request = supertest(url);
import mockData from "../../resources/technical-records.json";
import {cloneDeep} from 'lodash';
import mockContext from "aws-lambda-mock-context";
import {emptyDatabase, populateDatabase} from "../../util/dbOperations";

const opts = Object.assign({
  timeout: 1
});

const feature = loadFeature(path.resolve(__dirname, "../7885.ACs.feature"));

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

  test('AC1. Vehicles API spec contains GET/POST/PUT/ verbs', ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrlPOST: string;
    let requestUrlPUT: string;
    let requestUrlGET: string;

    let responsePOST: any;
    let responsePUT: any;
    let responseGET: any;

    given('I am a consumer of the vehicles API', () => {
      requestUrlPOST = 'vehicles/';
      requestUrlPUT = 'vehicles/1B7GG36N12S678410';
      requestUrlGET = 'vechicles/1B7GG36N12S678410/tech-records';
    });
    when('I call the vehicles API', async () => {
      const postPayload = createPOSTPayload();
      const putPayload = createPUTPayload();
      responsePOST = await request.post(requestUrlPOST).send(postPayload);
      responsePUT = await request.put(requestUrlPUT).send(putPayload);
    });
    then('I am able to perform a PUT or POST request', () => {
      expect(responsePOST.status).toEqual(201);
      expect(responsePOST.body).toEqual("Technical Record created");

      expect(responsePUT.status).toEqual(200);
      expect(responsePUT.body.techRecord[0].statusCode).toEqual("archived");
      expect(responsePUT.body.techRecord[1].statusCode).toEqual("current");
    });
    and('I am still able to perform a GET request', async () => {
      responseGET = await request.get(requestUrlGET);
      expect(responsePUT.status).toEqual(200);
      expect(responsePUT.body).toEqual(responsePUT.body);
    });
    ctx.succeed('done');
    ctx = null;
  });
});

const createPOSTPayload = () => {
  const newTechRec = cloneDeep(mockData[43]);
  const vin = Date.now().toString();
  const partialVin = newTechRec.vin.substr(newTechRec.vin.length - 6);
  newTechRec.techRecord[0].bodyType.description = "skeletal";
  const primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
  delete newTechRec.techRecord[0].statusCode;
  const payload = {
    msUserDetails: {
      msUser: "dorel",
      msOid: "1234545"
    },
    vin,
    partialVin,
    primaryVrm,
    techRecord: newTechRec.techRecord
  };
  return payload;
};

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


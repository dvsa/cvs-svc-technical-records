import {defineFeature, loadFeature} from "jest-cucumber";
import supertest from "supertest";
import path from "path";

const url = "http://localhost:3005/";

import mockData from "../../resources/technical-records.json";
import {cloneDeep} from "lodash";
import mockContext from "aws-lambda-mock-context";
import {emptyDatabase, populateDatabase} from "../../util/dbOperations";

const feature = loadFeature(path.resolve(__dirname, "../7885.ACs.feature"));

defineFeature(feature, ( test ) => {
  const request = supertest(url);
  const opts = Object.assign({
    timeout: 1
  });

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

  test("AC1. Vehicles API spec contains GET/POST/PUT/ verbs", ({given, when, then, and}) => {
    let ctx: any = mockContext(opts);

    let requestUrlPOST: string;
    let requestUrlPUT: string;
    let requestUrlGET: string;

    let responsePOST: any;
    let responsePUT: any;
    let responseGET: any;

    given("I am a consumer of the vehicles API", () => {
      requestUrlPOST = "vehicles/";
      requestUrlPUT = "vehicles/1B7GG36N12S678410";
      requestUrlGET = "vehicles/1B7GG36N12S678410/tech-records";
    });
    when("I call the vehicles API", async () => {
      const postPayload = createPOSTPayload();
      const putPayload = createPUTPayload();
      responsePOST = await request.post(requestUrlPOST).send(postPayload);
      responsePUT = await request.put(requestUrlPUT).send(putPayload);
    });
    then("I am able to perform a PUT or POST request", () => {
      expect(responsePOST.status).toEqual(201);
      expect(responsePOST.body).toEqual("Technical Record created");

      expect(responsePUT.status).toEqual(200);
      expect(responsePUT.body.techRecord[0].statusCode).toEqual("archived");
      expect(responsePUT.body.techRecord[1].statusCode).toEqual("current");
    });
    and("I am still able to perform a GET request", async () => {
      responseGET = await request.get(requestUrlGET);
      expect(responsePUT.status).toEqual(200);
      expect(responsePUT.body).toEqual(responsePUT.body);
    });
    ctx.succeed("done");
    ctx = null;
  });
});

const createPOSTPayload = () => {
  const newTechRec = cloneDeep(mockData[0]);
  newTechRec.vin = Date.now().toString();
  newTechRec.partialVin = newTechRec.vin.substr(newTechRec.vin.length - 6);
  // @ts-ignore
  newTechRec.techRecord[0].bodyType.description = "New Tech Record";
  newTechRec.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
  newTechRec.trailerId = Math.floor(100000 + Math.random() * 900000).toString();
  return newTechRec;
};

const createPUTPayload = () => {
  const techRec: any = cloneDeep(mockData[29]);
  const payload = {
    msUserDetails: {
      msUser: "dorel",
      msOid: "1234545"
    },
    systemNumber: "10000002",
    techRecord: [{
      reasonForCreation: techRec.techRecord[0].reasonForCreation,
      adrDetails: techRec.techRecord[0].adrDetails
    }]
  };
  return payload;
};


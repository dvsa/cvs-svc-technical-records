import { defineFeature, loadFeature } from "jest-cucumber";
import supertest from "supertest";
import path from "path";
import mockData from "../../resources/technical-records.json";
import { emptyDatabase, populateDatabase } from "../../util/dbOperations";
import { cloneDeep } from "lodash";
import { EU_VEHICLE_CATEGORY } from '../../../src/assets';

const url = "http://localhost:3005/";
const request = supertest(url);

const createPOSTPayload = () => {
  const techRec: any = cloneDeep(mockData[43]);
  delete techRec.techRecord[0].statusCode;
  const payload = {
    msUserDetails: {
      msUser: "dorel",
      msOid: "1234545",
    },
    primaryVrm: Math.floor(100000 + Math.random() * 900000).toString(),
    vin: Date.now().toString(),
    techRecord: techRec.techRecord,
  };
  return payload;
};

const feature = loadFeature(path.resolve(__dirname, "../10213.ACs.feature"));

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

  test("AC1. POST: Partial VIN is autopopulated", ({given, when, then, and}) => {
    let requestUrlPOST: string;
    let requestUrlGET: string;
    const postPayload = createPOSTPayload();
    let responsePOST: any;
    let responseGET: any;
    const partialVin: string = postPayload.vin.substr(postPayload.vin.length - 6);

    given("I am a consumer of the vehicles API", () => {
      requestUrlPOST = "vehicles";
      requestUrlGET = `vehicles/${partialVin}/tech-records`;
    });
    and("I have completed the \"vin\" field", () => {
      expect(postPayload.vin).toBeDefined();
    });
    when("I submit my request via the POST method", async () => {
      responsePOST = await request.post(requestUrlPOST).send(postPayload);
      expect(responsePOST.status).toEqual(201);
    });
    then("the partialVin is autopopulated, as the last 6 digits of the vin", async () => {
      responseGET = await request.get(requestUrlGET);
      expect(responseGET.body[0].vin).toEqual(postPayload.vin);
    });
  });

  test("AC2. POST: Vehicle class code is autopopulated", ({
    given,
    when,
    then,
    and,
  }) => {
    let requestUrlPOST: string;
    let requestUrlGET: string;
    const postPayload = createPOSTPayload();
    let responsePOST: any;
    let responseGET: any;

    given("I am a consumer of the vehicles API", () => {
      requestUrlPOST = "vehicles";
      requestUrlGET = `vehicles/${postPayload.vin}/tech-records`;
    });
    and('I have completed the "vehicle class description" field', () => {
      postPayload.techRecord[0].vehicleClass = {
        description: "MOT class 4",
      };
    });
    when("I submit my request via the POST method", async () => {
      responsePOST = await request.post(requestUrlPOST).send(postPayload);
    });
    then(
      "the corresponding vehicle class code is autopopulated, as per the linked excel",
      async () => {
        responseGET = await request.get(requestUrlGET);
        expect(responseGET.body[0].techRecord[0].vehicleClass.code).toEqual(
          "4"
        );
      }
    );
  });

  test("AC3. POST: Body type code is autopopulated", ({
    given,
    when,
    then,
    and,
  }) => {
    let requestUrlPOST: string;
    let requestUrlGET: string;
    const postPayload = createPOSTPayload();
    let responsePOST: any;
    let responseGET: any;

    given("I am a consumer of the vehicles API", () => {
      requestUrlPOST = "vehicles";
      requestUrlGET = `vehicles/${postPayload.vin}/tech-records`;
    });
    and('I have completed the "body type description" field', () => {
      postPayload.techRecord[0].euVehicleCategory = EU_VEHICLE_CATEGORY.O2;
      postPayload.techRecord[0].bodyType = {
        description: "skeletal",
      };
    });
    when("I submit my request via the POST method", async () => {
      responsePOST = await request.post(requestUrlPOST).send(postPayload);
    });
    then(
      "the corresponding body type code is autopopulated, as per the linked excel",
      async () => {
        responseGET = await request.get(requestUrlGET);
        expect(responseGET.body[0].techRecord[0].bodyType.code).toEqual("k");
      }
    );
  });
});

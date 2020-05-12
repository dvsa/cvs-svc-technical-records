import {handler} from "../../src/handler";
import mockData from "../resources/technical-records.json";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {cloneDeep} from "lodash";
import {emptyDatabase, populateDatabase} from "../util/dbOperations";
import {Context} from "aws-lambda";
import Configuration from "../../src/utils/Configuration";

describe("TechRecords", () => {
  // @ts-ignore
  const ctx: Context = null;
  beforeAll(async () => {
    // await emptyDatabase();
    await populateDatabase();
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(false);
  });

  beforeEach(async () => {
    // await populateDatabase();
  });

  afterEach(async () => {
    // await emptyDatabase();
  });

  afterAll(async () => {
    // await populateDatabase();
    await emptyDatabase();
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(true);
  });

  const msUserDetails = {
    msUser: "dorel",
    msOid: "1234545"
  };

  it("should detect exported path /vehicles", async () => {
    // @ts-ignore
    const techRecord: ITechRecordWrapper = cloneDeep(mockData[43]);
    const vin = Date.now().toString();
    techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
    techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
    delete techRecord.techRecord[0].statusCode;
    const payload = {
      msUserDetails,
      vin,
      primaryVrm: techRecord.primaryVrm,
      techRecord: techRecord.techRecord
    };
    const vehicleRecordEvent = {
      path: "/vehicles",
      pathParameters: null,
      resource: "/vehicles/{searchIdentifier}/tech-records",
      httpMethod: "POST",
      body: JSON.stringify(payload),
      queryStringParameters: null
    };

    const opts = Object.assign({
      timeout: 1
    });
    const response = await handler(vehicleRecordEvent, ctx);
    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body)).toEqual("Technical Record created");
  });

  it("should detect exported path /vehicles/{systemNumber}", async () => {
    // @ts-ignore
    const techRecord: ITechRecordWrapper = cloneDeep(mockData[43]);
    const payload = {
      msUserDetails,
      techRecord: techRecord.techRecord
    };
    const vehicleRecordEvent = {
      path: "/vehicles/1100047",
      pathParameters: {
        systemNumber: "1100047"
      },
      resource: "/vehicles/{systemNumber}",
      httpMethod: "PUT",
      body: JSON.stringify(payload)
    };

    const response = await handler(vehicleRecordEvent, ctx);
    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body).techRecord[0].statusCode).toEqual("archived");
    expect(JSON.parse(response.body).techRecord[1].statusCode).toEqual("provisional");

  });
});

import {handler} from "../../src/handler";
import mockContext from "aws-lambda-mock-context";
import mockData from "../resources/technical-records.json";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {cloneDeep} from "lodash";
import {emptyDatabase, populateDatabase} from "../util/dbOperations";

describe("TechRecords", () => {

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

  const msUserDetails = {
    msUser: "dorel",
    msOid: "1234545"
  };

  it("should detect exported path /vehicles", async () => {
    // @ts-ignore
    const techRecord: ITechRecordWrapper = cloneDeep(mockData[0]);
    techRecord.vin = Date.now().toString();
    techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
    techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
    techRecord.trailerId = Math.floor(100000 + Math.random() * 900000).toString();

    const vehicleRecordEvent = {
      path: "/vehicles",
      pathParameters: null,
      resource: "/vehicles/{searchIdentifier}/tech-records",
      httpMethod: "POST",
      body: JSON.stringify(techRecord),
      queryStringParameters: null
    };

    const opts = Object.assign({
      timeout: 1
    });
    let ctx: any = mockContext(opts);
    const response = await handler(vehicleRecordEvent, ctx);
    ctx.succeed(response);
    ctx = null;
    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body)).toEqual("Technical Record created");
  });

  it("should detect exported path /vehicles/{vin}", async () => {
    // @ts-ignore
    const techRecord: ITechRecordWrapper = cloneDeep(mockData[29]);
    delete techRecord.vin;
    const payload = {
      msUserDetails,
      systemNumber: techRecord.systemNumber,
      techRecord: [{
        reasonForCreation: techRecord.techRecord[0].reasonForCreation,
        adrDetails: techRecord.techRecord[0].adrDetails
      }]
    };
    const vehicleRecordEvent = {
      path: "/vehicles/ABCDEFGH777777",
      pathParameters: {
        vin: "ABCDEFGH777777"
      },
      resource: "/vehicles/{vin}",
      httpMethod: "PUT",
      body: JSON.stringify(payload),
      queryStringParameters: null
    };

    const opts = Object.assign({
      timeout: 1
    });
    let ctx: any = mockContext(opts);
    const response = await handler(vehicleRecordEvent, ctx);
    ctx.succeed(response);
    ctx = null;
    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body).techRecord[0].statusCode).toEqual("archived");
    expect(JSON.parse(response.body).techRecord[1].statusCode).toEqual("current");

  });
});

import {handler} from "../../src/handler";
import mockContext from "aws-lambda-mock-context";
import mockData from "../resources/technical-records.json";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import { cloneDeep } from "lodash";

describe("TechRecords", () => {

  it("should detect exported path /vehicles/{searchIdentifier}/tech-records", async () => {
    const vehicleRecordEvent = {
      path: "/vehicles/YV31MEC18GA011900/tech-records",
      pathParameters: {
        searchIdentifier: "YV31MEC18GA011900"
      },
      resource: "/vehicles/{searchIdentifier}/tech-records",
      httpMethod: "GET",
      queryStringParameters: {
        status: "all"
      }
    };

    const opts = Object.assign({
      timeout: 0.5
    });
    let ctx: any = mockContext(opts);
    const response = await handler(vehicleRecordEvent, ctx);
    ctx.succeed(response);
    ctx = null;
    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body).techRecord.length).toEqual(10);
  });

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
      timeout: 0.5
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
    const techRecord: ITechRecordWrapper = cloneDeep(mockData[1]);
    delete techRecord.vin;
    techRecord.techRecord[0].bodyType.description = "updated tech record";
    const vehicleRecordEvent = {
      path: "/vehicles/1B7GG36N12S678410",
      pathParameters: {
        vin: "1B7GG36N12S678410"
      },
      resource: "/vehicles/{vin}",
      httpMethod: "PUT",
      body: JSON.stringify(techRecord),
      queryStringParameters: null
    };

    const opts = Object.assign({
      timeout: 0.5
    });
    let ctx: any = mockContext(opts);
    const response = await handler(vehicleRecordEvent, ctx);
    ctx.succeed(response);
    ctx = null;
    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body).techRecord[0].bodyType.description).toEqual("updated tech record");
  });
});

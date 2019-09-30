import {handler} from "../../src/handler";
import Configuration from "../../src/utils/Configuration";
import HTTPResponse from "../../src/models/HTTPResponse";
import mockContext from "aws-lambda-mock-context";
import event from "../resources/event.json";
import TechRecordsService from "../../src/services/TechRecordsService";

jest.mock("../../src/services/TechRecordsService");
const opts = Object.assign({
  timeout: 0.2
});

describe("The lambda function handler", () => {
  context("With correct Config", () => {
    context("should correctly handle incoming events", () => {
      it("should call functions with correct event payload", async () => {
        // Specify your event, with correct path, payload etc
        const vehicleRecordEvent = {
          path: "/vehicles/YV31MEC18GA011944/tech-records",
          pathParameters: null,
          resource: "/vehicles",
          httpMethod: "GET",
          queryStringParameters: null
        };

        const ctx: any = mockContext(opts);

        // Stub out the actual functions
        TechRecordsService.prototype.getTechRecordsList = jest.fn().mockImplementation(() => {
          return Promise.resolve(new HTTPResponse(200, {}));
        });

        const result = await handler(vehicleRecordEvent, ctx);
        ctx.succeed(result);
        expect(result.statusCode).toEqual(200);
        expect(TechRecordsService.prototype.getTechRecordsList).toHaveBeenCalled();
      });

      it("should return error on empty event", async () => {
        let ctx: any = mockContext(opts);
        const result = await handler(null, ctx);
        ctx.succeed(result);
        ctx = null;

        expect(result).toBeInstanceOf(HTTPResponse);
        expect(result.statusCode).toEqual(400);
        expect(result.body).toEqual(JSON.stringify("AWS event is empty. Check your test event."));
      });

      it("should return error on invalid body json", async () => {
        const invalidBodyEvent = Object.assign({}, event);
        invalidBodyEvent.body = '{"hello":}';

        const ctx: any = mockContext(opts);
        const result = await handler(invalidBodyEvent, ctx);
        expect(result).toBeInstanceOf(HTTPResponse);
        expect(result.statusCode).toEqual(400);
        expect(result.body).toEqual(JSON.stringify("Body is not a valid JSON."));
      });

      it("should return a Route Not Found error on invalid path", async () => {
        const invalidPathEvent = Object.assign({}, event);
        invalidPathEvent.path = "/vehicles/123/doesntExist";

        let ctx: any = mockContext(opts);
        const result = await handler(invalidPathEvent, ctx);
        ctx.succeed(result);
        ctx = null;
        expect(result.statusCode).toEqual(400);
        expect(result.body).toStrictEqual(JSON.stringify({error: `Route ${invalidPathEvent.httpMethod} ${invalidPathEvent.path} was not found.`}));
      });
    });
  });

  context("should correctly handle exported functions", () => {
    it("should call the /vehicles/{searchIdentifier}/tech-records function with correct event payload", async () => {
      // Specify your event, with correct path, payload etc
      const vehicleRecordEvent = {
        path: "/vehicles/12345678/tech-records",
        pathParameters: {
          searchIdentifier: "12345678"
        },
        resource: "/vehicles/{searchIdentifier}/tech-records",
        httpMethod: "GET",
        queryStringParameters: {
          status: "all"
        }
      };

      const ctx: any = mockContext(opts);

      // Stub out the actual functions
      TechRecordsService.prototype.getTechRecordsList = jest.fn().mockImplementation(() => {
        return Promise.resolve(new HTTPResponse(200, {}));
      });

      const result = await handler(vehicleRecordEvent, ctx);
      ctx.succeed(result);
      expect(result.statusCode).toEqual(200);
      expect(TechRecordsService.prototype.getTechRecordsList).toHaveBeenCalled();
    });
  });
});

context("With no routes defined in config", () => {
  it("should return a Route Not Found error", async () => {

    const getFunctions = Configuration.prototype.getFunctions;
    Configuration.prototype.getFunctions = jest.fn().mockImplementation(() => []);
    const eventNoRoute = {httpMethod: "GET", path: ""};
    let ctx: any = mockContext(opts);
    const result = await handler(eventNoRoute, ctx);
    ctx.succeed(result);
    ctx = null;
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(JSON.stringify({error: `Route ${eventNoRoute.httpMethod} ${eventNoRoute.path} was not found.`}));
    Configuration.prototype.getFunctions = getFunctions;
  });
});

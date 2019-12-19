import {handler} from "../../src/handler";
import Configuration from "../../src/utils/Configuration";
import HTTPResponse from "../../src/models/HTTPResponse";
import mockContext from "aws-lambda-mock-context";
import event from "../resources/event.json";
import TechRecordsService from "../../src/services/TechRecordsService";
import * as postTechRecords from "../../src/functions/postTechRecords";
import * as updateTechRecords from "../../src/functions/updateTechRecords";
import mockData from "../resources/technical-records.json";
import {cloneDeep} from "lodash";

jest.mock("../../src/services/TechRecordsService");
const opts = Object.assign({
  timeout: 1
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

        let ctx: any = mockContext(opts);

        // Stub out the actual functions
        TechRecordsService.prototype.getTechRecordsList = jest.fn().mockImplementation(() => {
          return Promise.resolve(new HTTPResponse(200, {}));
        });

        const result = await handler(vehicleRecordEvent, ctx);
        ctx.succeed(result);
        ctx = null;
        expect(result.statusCode).toEqual(200);
        expect(TechRecordsService.prototype.getTechRecordsList).toHaveBeenCalled();
      });

      it("should call the /vehicles/{vin}/download-file?filename=someFilename.pdf function with correct event payload", async () => {
        // Specify your event, with correct path, payload etc
        const vehicleRecordEvent = {
          path: "/vehicles/YV31MEC18GA011944/download-file",
          pathParameters: {
            vin: "YV31MEC18GA011944"
          },
          resource: "/vehicles",
          httpMethod: "GET",
          queryStringParameters: {
            filename: "someFilename.pdf"
          }
        };

        let ctx: any = mockContext(opts);

        // Stub out the actual functions
        TechRecordsService.prototype.downloadFile = jest.fn().mockImplementation(() => {
          return Promise.resolve(new HTTPResponse(200, {}));
        });

        const result = await handler(vehicleRecordEvent, ctx);
        ctx.succeed(result);
        ctx = null;
        expect(result.statusCode).toEqual(200);
        expect(TechRecordsService.prototype.downloadFile).toHaveBeenCalled();
      });

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

        let ctx: any = mockContext(opts);

        // Stub out the actual functions
        TechRecordsService.prototype.getTechRecordsList = jest.fn().mockImplementation(() => {
          return Promise.resolve(new HTTPResponse(200, {}));
        });

        const result = await handler(vehicleRecordEvent, ctx);
        ctx.succeed(result);
        ctx = null;
        expect(result.statusCode).toEqual(200);
        expect(TechRecordsService.prototype.getTechRecordsList).toHaveBeenCalled();
      });

      it("should call /vehicles function with correct event payload", async () => {
        let ctx: any = mockContext(opts);
        // Specify your event, with correct path, payload etc
        const payload = {
          msUserDetails: {
            msUser: "user",
            msOid: "12345"
          },
          vin: "12345678910",
          techRecord: cloneDeep(mockData[26]).techRecord
        };
        const vehicleRecordEvent = {
          path: "/vehicles",
          pathParameters: null,
          resource: "/vehicles/{searchIdentifier}/tech-records",
          httpMethod: "POST",
          body: JSON.stringify(payload),
          queryStringParameters: null
        };

        // Stub out the actual functions
        TechRecordsService.prototype.insertTechRecord = jest.fn().mockImplementation(() => {
          return Promise.resolve(new HTTPResponse(201, {}));
        });
        const result = await handler(vehicleRecordEvent, ctx);
        ctx.succeed(result);
        ctx = null;
        expect(result.statusCode).toEqual(201);
        expect(TechRecordsService.prototype.insertTechRecord).toHaveBeenCalled();
      });

      it("should call /vehicles/{vin} function with correct event payload", async () => {
        let ctx: any = mockContext(opts);
        // Specify your event, with correct path, payload etc
        const payload = {
          msUserDetails: {
            msUser: "dorel",
            msOid: "12314234"
          },
          techRecord: mockData[26].techRecord
        };
        const vehicleRecordEvent = {
          path: "/vehicles/XMGDE02FS0H999987",
          pathParameters: {
            vin: "XMGDE02FS0H999987"
          },
          resource: "/vehicles/{vin}",
          httpMethod: "PUT",
          body: JSON.stringify(payload),
          queryStringParameters: null
        };

        // Stub out the actual functions
        TechRecordsService.prototype.updateTechRecord = jest.fn().mockImplementation(() => {
          return Promise.resolve(new HTTPResponse(200, {}));
        });
        const result = await handler(vehicleRecordEvent, ctx);
        ctx.succeed(result);
        ctx = null;
        expect(result.statusCode).toEqual(200);
        expect(TechRecordsService.prototype.updateTechRecord).toHaveBeenCalled();
      });

      it("should call the update-status function with correct event payload", async () => {
        let ctx: any = mockContext(opts);

        const vehicleRecordEvent = {
          path: "/vehicles/update-status/XMGDE02FS0H999987",
          pathParameters: {
            vin: "XMGDE02FS0H999987"
          },
          resource: "/vehicles/update-status/{vin}",
          httpMethod: "PUT",
          queryStringParameters: {
            testStatus: "submitted",
            testResult: "pass",
            testTypeId: "41",
          },
        };
        TechRecordsService.isStatusUpdateRequired = jest.fn().mockReturnValue(true);
        TechRecordsService.prototype.updateTechRecordStatusCode = jest.fn().mockImplementation(() => {
          return Promise.resolve(new HTTPResponse(200, {}));
        });
        const result = await handler(vehicleRecordEvent, ctx);
        ctx.succeed(result);
        ctx = null;

        expect(result.statusCode).toEqual(200);
        expect(TechRecordsService.prototype.updateTechRecordStatusCode).toHaveBeenCalled();
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

        let ctx: any = mockContext(opts);
        const result = await handler(invalidBodyEvent, ctx);
        ctx.succeed(result);
        ctx = null;
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
});

describe("The configuration service", () => {
  context("with good config file", () => {
    it("should return local versions of the config if specified", () => {
      process.env.BRANCH = "local";
      const configService = Configuration.getInstance();
      const functions = configService.getFunctions();
      expect(functions.length).toEqual(5);
      expect(functions[0].name).toEqual("getTechRecords");
      expect(functions[1].name).toEqual("postTechRecords");
      expect(functions[2].name).toEqual("updateTechRecords");
      expect(functions[3].name).toEqual("downloadDocument");
      expect(functions[4].name).toEqual("updateTechRecordStatus");


      const DBConfig = configService.getDynamoDBConfig();
      expect(DBConfig).toEqual(configService.getConfig().dynamodb.local);

      // No Endpoints for this service
    });

    it("should return local-global versions of the config if specified", () => {
      process.env.BRANCH = "local-global";
      const configService = Configuration.getInstance();
      const functions = configService.getFunctions();
      expect(functions.length).toEqual(5);
      expect(functions[0].name).toEqual("getTechRecords");
      expect(functions[1].name).toEqual("postTechRecords");
      expect(functions[2].name).toEqual("updateTechRecords");
      expect(functions[3].name).toEqual("downloadDocument");
      expect(functions[4].name).toEqual("updateTechRecordStatus");

      const DBConfig = configService.getDynamoDBConfig();
      expect(DBConfig).toEqual(configService.getConfig().dynamodb["local-global"]);

      // No Endpoints for this service
    });

    it("should return remote versions of the config by default", () => {
      process.env.BRANCH = "CVSB-XXX";
      const configService = Configuration.getInstance();
      const functions = configService.getFunctions();
      expect(functions.length).toEqual(5);
      expect(functions[0].name).toEqual("getTechRecords");
      expect(functions[1].name).toEqual("postTechRecords");
      expect(functions[2].name).toEqual("updateTechRecords");
      expect(functions[3].name).toEqual("downloadDocument");
      expect(functions[4].name).toEqual("updateTechRecordStatus");

      const DBConfig = configService.getDynamoDBConfig();
      expect(DBConfig).toEqual(configService.getConfig().dynamodb.remote);

      // No Endpoints for this service
    });
  });

  context("with bad config file", () => {
    it("should return an error for missing functions from getFunctions", () => {
      const config = new Configuration("../../tests/resources/badConfig.yml");
      try {
        config.getFunctions();
      } catch (e) {
        expect(e.message).toEqual("Functions were not defined in the config file.");
      }
    });

    it("should return an error for missing DB Config from getDynamoDBConfig", () => {
      const config = new Configuration("../../tests/resources/badConfig.yml");
      try {
        config.getDynamoDBConfig();
      } catch (e) {
        expect(e.message).toEqual("DynamoDB config is not defined in the config file.");
      }
    });
  });
});

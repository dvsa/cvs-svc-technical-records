import sinon from "sinon";
import {expect} from "chai";
import {handler} from "../../src/handler";
import * as getTechRecords from "../../src/functions/getTechRecords";
import Configuration from "../../src/utils/Configuration";
import HTTPResponse from "../../src/models/HTTPResponse";
import mockContext from "aws-lambda-mock-context";
import event from "../resources/event.json";
const ctx = mockContext();


describe("The lambda function handler", () => {
  context("With correct Config", () => {
    context("should correctly handle incoming events", () => {
      it("should call functions with correct event payload", async () => {
        // Specify your event, with correct path, payload etc
        const vehicleRecordEvent = event;

        // Stub out the actual functions
        const getTechRecordsStub = sinon.stub(getTechRecords);
        getTechRecordsStub.getTechRecords.returns(new HTTPResponse(200, {}));

        const result = await handler(vehicleRecordEvent, ctx);
        expect(result.statusCode).to.equal(200);
        sinon.assert.called(getTechRecordsStub.getTechRecords);
      });

      it("should return error on empty event", async () => {
        const result = await handler(null, ctx);

        expect(result).to.be.instanceOf(HTTPResponse);
        expect(result.statusCode).to.equal(400);
        expect(result.body).to.equal(JSON.stringify("AWS event is empty. Check your test event."));
      });

      it("should return error on invalid body json", async () => {
        const invalidBodyEvent = Object.assign({}, event);
        invalidBodyEvent.body = '{"hello":}';

        const result = await handler(invalidBodyEvent, ctx);
        expect(result).to.be.instanceOf(HTTPResponse);
        expect(result.statusCode).to.equal(400);
        expect(result.body).to.equal(JSON.stringify("Body is not a valid JSON."));
      });

      it("should return a Route Not Found error on invalid path", async () => {
        const invalidPathEvent = Object.assign({}, event);
        // invalidPathEvent.body = ""
        invalidPathEvent.path = "/vehicles/123/doesntExist";

        const result = await handler(invalidPathEvent, ctx);
        expect(result.statusCode).to.equal(400);
        expect(result.body).to.deep.equals(JSON.stringify({ error: `Route ${invalidPathEvent.httpMethod} ${invalidPathEvent.path} was not found.` }));
      });
    });
  });

  context("With no routes defined in config", () => {
    it("should return a Route Not Found error", async () => {
      // Stub Config getFunctions method and return empty array instead
      const configStub = sinon.stub(Configuration.prototype, "getFunctions").returns([]);

      const result = await handler(event, ctx);
      expect(result.statusCode).to.equal(400);
      expect(result.body).to.deep.equals(JSON.stringify({ error: `Route ${event.httpMethod} ${event.path} was not found.` }));
      configStub.restore();
    });
  });
});

describe("The configuration service", () => {
  context("with good config file", () => {
    it("should return local versions of the config if specified", () => {
      process.env.BRANCH = "local";
      const configService = Configuration.getInstance();
      const functions = configService.getFunctions();
      expect(functions.length).to.equal(1);
      expect(functions[0].name).to.equal("getTechRecords");

      const DBConfig = configService.getDynamoDBConfig();
      expect(DBConfig).to.equal(configService.getConfig().dynamodb.local);

      // No Endpoints for this service
    });

    it("should return local-global versions of the config if specified", () => {
      process.env.BRANCH = "local-global";
      const configService = Configuration.getInstance();
      const functions = configService.getFunctions();
      expect(functions.length).to.equal(1);
      expect(functions[0].name).to.equal("getTechRecords");

      const DBConfig = configService.getDynamoDBConfig();
      expect(DBConfig).to.equal(configService.getConfig().dynamodb["local-global"]);

      // No Endpoints for this service
    });

    it("should return remote versions of the config by default", () => {
      process.env.BRANCH = "CVSB-XXX";
      const configService = Configuration.getInstance();
      const functions = configService.getFunctions();
      expect(functions.length).to.equal(1);
      expect(functions[0].name).to.equal("getTechRecords");

      const DBConfig = configService.getDynamoDBConfig();
      expect(DBConfig).to.equal(configService.getConfig().dynamodb.remote);

      // No Endpoints for this service
    });
  });

  context("with bad config file", () => {
    it("should return an error for missing functions from getFunctions", () => {
      const config = new Configuration("../../tests/resources/badConfig.yml");
      try {
        config.getFunctions();
      } catch (e) {
        expect(e.message).to.equal("Functions were not defined in the config file.");
      }
    });

    it("should return an error for missing DB Config from getDynamoDBConfig", () => {
      const config = new Configuration("../../tests/resources/badConfig.yml");
      try {
        config.getDynamoDBConfig();
      } catch (e) {
        expect(e.message).to.equal("DynamoDB config is not defined in the config file.");
      }
    });
  });

  afterEach(() => {
    // process.env.BRANCH = 'local'
  });
});

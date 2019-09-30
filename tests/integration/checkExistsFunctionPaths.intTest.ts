import {handler} from "../../src/handler";
import mockContext from "aws-lambda-mock-context";
import {populateDatabase, emptyDatabase} from "../util/dbOperations";

describe("techRecords", () => {
  describe("getTechRecords", () => {
    beforeAll(async () => {
      jest.restoreAllMocks();
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
      expect(JSON.parse(response.body).techRecord.length).toEqual(2);
    });
  });
});

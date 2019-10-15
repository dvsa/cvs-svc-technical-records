import supertest from "supertest";

const url = "http://localhost:3005/";
const request = supertest(url);
import {populateDatabase, emptyDatabase, convertToResponse} from "../util/dbOperations";
import mockData from "../resources/technical-records.json";

describe("techRecords", () => {
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

  context("AC1 Backend Service Correctly Interprets The \"status\" value of \"all\"\n" +
    "GIVEN I am a consumer of the vehicles API \n" +
    "WHEN I call the vehicles API passing a value of \"all\" for the \"status\" (in addition to the VIN/VRM)\n", () => {
    it("THEN the JSON response returns ALL technical records for that VIN/VRM (ALL STATUSES)", async () => {
      const res = await request.get("vehicles/C47WLL/tech-records?status=all");
      expect(res.status).toEqual(200);
      expect(res.header["access-control-allow-origin"]).toEqual("*");
      expect(res.header["access-control-allow-credentials"]).toEqual("true");
      expect(convertToResponse(mockData[8])).toEqual(res.body);
      expect(res.body.techRecord.length).toEqual(mockData[8].techRecord.length);
    });
  });
});

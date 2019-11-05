import {defineFeature, loadFeature} from 'jest-cucumber';
import supertest from "supertest";
import path from 'path';

const url = "http://localhost:3005/";
const request = supertest(url);
import mockData from "../../resources/technical-records.json";
import mockContext from "aws-lambda-mock-context";
import {emptyDatabase, populateDatabase} from "../../util/dbOperations";

const opts = Object.assign({
  timeout: 0.5
});

const feature = loadFeature(path.resolve(__dirname, "../7743.ACs.feature"));

defineFeature(feature, test => {
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

  let ctx: any = mockContext(opts);
  test('AC1. Backend Service Correctly Interprets The "status" value of "all"', ({given, when, then, and}) => {
    let requestUrl: string;
    let response: any;
    given('I am a consumer of the vehicles API', () => {
      requestUrl = 'vehicles/C47WLL/tech-records?status=all';
    });
    when('I call the vehicles API passing a value of "all" for the "status" (in addition to the VIN/VRM)', async () => {
      response = await request.get(requestUrl);
    });
    then('the JSON response returns ALL technical records for that VIN/VRM (ALL STATUSES)', () => {
      expect(response.status).toEqual(200);
      expect(response.body.techRecord.length).toEqual(mockData[8].techRecord.length);
    });
  });
  ctx.succeed('done');
  ctx = null;
});

import { convertToResponse } from './../../util/dbOperations';
import { defineFeature, loadFeature } from 'jest-cucumber';
import supertest from "supertest";
import path from 'path';
import { emptyDatabase, populateDatabase } from "../../util/dbOperations";
import mockData from "../../resources/technical-records.json";
import { cloneDeep } from "lodash";
import mockContext from "aws-lambda-mock-context";
import ITechRecord from '../../../@Types/ITechRecord';

const url = "http://localhost:3005/";
const request = supertest(url);
const opts = Object.assign({
  timeout: 0.5
});
const feature = loadFeature(path.resolve(__dirname, "../4924.ACs.feature"));

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


  test('AC1 API Consumer retrieve the Vehicle Technical Records', ({ given, when, then, and }) => {
    let requestUrl: string;
    let response: any;
    let expectedResponse: any;

    given('I am an API Consumer', () => {
      requestUrl = 'vehicles/012999/tech-records';
    });
    when('I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records', async () => {
      response = await request.get(requestUrl);
    });
    and('there is a vehicle that can be identified by the value provided for the searchIdentifier', () => {
      expectedResponse = convertToResponse(cloneDeep(mockData[29]));
    });
    then('the system returns a body message containing a single CompleteTechRecord', () => {
      expect(expectedResponse).toEqual(response.body);
      let techRecord: ITechRecord[] = response.body.techRecord;
      expect(techRecord[0].adrDetails).toBeTruthy();
    });
    and('the system returns an HTTP status code 200 OK', () => {
      expect(response.status).toEqual(200);
    });
  });

  test('AC2 No data returned', ({ given, when, then, and }) => {
    let requestUrl: string;
    let response: any;
    given('I am an API Consumer', () => {
      requestUrl = 'vehicles/T72745555/tech-records';
    });
    when('I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records', async () => {
      response = await request.get(requestUrl);
    });
    and('no data is found', () => {
    });
    then('the system returns an HTTP status code 404', () => {
      expect(response.status).toEqual(404);
    });
  });

  test('AC3 Multiple results returned', ({ given, when, then, and }) => {
    let requestUrl: string;
    let response: any;
    given('I am an API Consumer', () => {
      requestUrl = 'vehicles/678413/tech-records';
    });
    when('I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records', async () => {
      response = await request.get(requestUrl);
    });
    and('multiple results found (more than one CompleteTechRecord object is returned)', () => {
    });
    then('the system returns an HTTP status code 422', () => {
      expect(response.status).toEqual(422);
    });
  });


  ctx.succeed('done');
  ctx = null;
});
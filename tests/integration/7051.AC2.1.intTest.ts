import supertest from "supertest";
const url = "http://localhost:3005/";
const request = supertest(url);
import { populateDatabase, emptyDatabase, convertTo7051Response, convertToResponse } from "../util/dbOperations";
import mockData from "../resources/technical-records.json";
import * as _ from "lodash";

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

    context("AC2.1 API Consumer retrieve the Vehicle Technical Records for - query parameter \"status\" is \"provisional_over_current\" & vehicle has both \"current\" and \"provisional\" technical records\n" +
    "GIVEN I am an API Consumer \n" +
    "WHEN I send a request to AWS_CVS_DOMAIN/vehicles/\n" +
    "{searchIdentifier}\n" +
    "/tech-records?status=provisional_over_current\n" +
    "AND the query parameter \"status\" is \"provisional_over_current\n" +
    "AND for the identified vehicle in the database there is a Technical Record with the \"statusCode\" = \"current\"\n" +
    "AND for the identified vehicle in the database there is a Technical Record with the \"statusCode\" = \"provisional\"\n", () => {
        it("THEN the system returns a body message containing a single CompleteTechRecord\n" +
        "AND the statusCode of the Technical Records \"provisional\"" +
        "AND the system returns an HTTP status code 200 OK", async () => {
            const expectedResponseD = convertTo7051Response(_.cloneDeep(mockData[26]), 0);
            const response = await request.get("vehicles/P012301270123/tech-records");
            expect(response.status).toEqual(200);
            expect(expectedResponseD).toEqual(response.body);
        });
    });
});

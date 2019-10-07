import supertest from "supertest";
const url = "http://localhost:3005/";
const request = supertest(url);
import { populateDatabase, emptyDatabase, convertTo7051Response, convertToResponse } from "../util/dbOperations";

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

    context("AC3 No data returned\n" +
        "GIVEN I am an API Consumer\n" +
        "WHEN I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}\n" +
        "/tech-records/\n" +
        "AND no data is found\n", () => {
        it("THEN the system returns an HTTP status code 404", async () => {
            const expectedResponseD = "The provided partial VIN returned more than one match.";
            const response = await request.get("vehicles/678413/tech-records");
            expect(response.status).toEqual(422);
            expect(expectedResponseD).toEqual(response.body);
        });
    });
});

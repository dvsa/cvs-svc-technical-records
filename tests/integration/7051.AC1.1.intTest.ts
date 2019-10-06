import supertest from "supertest";
const url = "http://localhost:3005/";
const request = supertest(url);
import { populateDatabase, emptyDatabase, convertTo7051Response, convertToResponse } from "../util/dbOperations";
import mockData from "../resources/technical-records.json";
import { HTTPRESPONSE } from "../../src/assets/Enums";
import * as _ from "lodash";

describe("techRecords", () => {
  describe("getTechRecords", () => {
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

    context("when database is populated", () => {
      context("AC1.1 API Consumer retrieve the Vehicle Technical Records \
              for - query parameter 'status' not provided & vehicle has both 'current' and 'provisional' technical records \
              GIVEN I am an API Consumer \
              WHEN I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records \
              AND the query parameter 'status' is not provided \
              AND for the identified vehicle in the database there is a Technical Record with the 'statusCode' = 'current'\
              AND for the identified vehicle in the database there is a Technical Record with the 'statusCode' = 'provisional' ", () => {
        it("THEN for the query parameter 'status', the default value 'provisional_over_current' will be taken into account \
              AND the system returns a body message containing a single CompleteTechRecord \
              AND the statusCode of the Technical Records 'provisional' \
              AND the system returns an HTTP status code 200 OK", async () => {
          const expectedResponseD = convertTo7051Response(_.cloneDeep(mockData[9]), 1);
          const response = await request.get("vehicles/YV31MEC18GA011911/tech-records");
          expect(response.status).toEqual(200);
          expect(expectedResponseD).toEqual(response.body);
        });
      });

      context("and statusCode is provided", () => {
        context("and the tech record for that Trailer ID has the statusCode provided", () => {
          it("should return the tech record for that Trailer ID with statusCode 'archived'", async () => {
            const response = await request.get("vehicles/Q000001/tech-records?status=archived");
            expect(response.status).toEqual(200);
            expect(convertToResponse(mockData[24])).toEqual(response.body);
          });
        });
      });

      context("and when a search by Trailer ID is done", () => {
        context("and no statusCode is provided", () => {
          context("and the tech record for that Trailer ID has statusCode 'current'", () => {
            it("should return the tech record for that Trailer ID with default status 'current'", async () => {
              const response = await request.get("vehicles/C000001/tech-records");
              expect(response.status).toEqual(200);
              expect(response.body).toEqual(convertToResponse(mockData[13]));
            });
          });
        });
      });

    });
  });
});

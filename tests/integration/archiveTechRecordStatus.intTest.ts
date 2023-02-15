import { emptyDatabase, populateDatabase } from "../util/dbOperations";
import LambdaTester from "lambda-tester";
import {
  HTTPRESPONSE,
  EU_VEHICLE_CATEGORY,
  STATUS
} from "../../src/assets/Enums";
import { archiveTechRecordStatus } from "../../src/functions/archiveTechRecordStatus";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import mockData from "../resources/technical-records.json";
import { cloneDeep } from "lodash";

const msUserDetails = {
  msUser: "dorel",
  msOid: "1234545"
};

describe("archiveTechRecordStatus", () => {
  beforeAll(async () => {
    jest.restoreAllMocks();
    // await emptyDatabase();
    // await populateDatabase();
  });
  beforeEach(async () => {
    await populateDatabase();
  });
  afterEach(async () => {
    // await emptyDatabase();
  });
  afterAll(async () => {
    await emptyDatabase();
  });

  context(
    "when trying to update a non archived vehicle tech record status to archived",
    () => {
      it("should update the status and set audit details", async () => {
        const systemNumber: string = "1100047";
        const techRecord: any = cloneDeep(mockData[43]);
        const payload = {
          vin: techRecord.vin,
          reasonForArchiving: "Test",
          systemNumber: techRecord.systemNumber,
          primaryVrm: techRecord.primaryVrm,
          msUserDetails,
          techRecord: techRecord.techRecord
        };
        expect.assertions(3);
        await LambdaTester(archiveTechRecordStatus)
          .event({
            path: `/vehicles/archive/${systemNumber}`,
            pathParameters: {
              systemNumber
            },
            queryStringParameters: {},
            body: payload,
            httpMethod: "PUT",
            resource: "/vehicles/archive/{systemNumber}"
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toBe(200);
            const techRecordWrapper: ITechRecordWrapper = JSON.parse(
              result.body
            );
            expect(techRecordWrapper.techRecord[0].statusCode).toBe(
              STATUS.ARCHIVED
            );
            expect(techRecordWrapper.techRecord[0].notes).toBe(
              "string\nTest"
            );
          });
      });
      it("should populate the historic vrm's", async () => {
        const systemNumber: string = "1100047";
        const techRecord: any = cloneDeep(mockData[43]);
        const payload = {
          vin: techRecord.vin,
          reasonForArchiving: "Test",
          systemNumber: techRecord.systemNumber,
          primaryVrm: techRecord.primaryVrm,
          msUserDetails,
          techRecord: techRecord.techRecord
        };
        expect.assertions(3);
        await LambdaTester(archiveTechRecordStatus)
          .event({
            path: `/vehicles/archive/${systemNumber}`,
            pathParameters: {
              systemNumber
            },
            queryStringParameters: {},
            body: payload,
            httpMethod: "PUT",
            resource: "/vehicles/archive/{systemNumber}"
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toBe(200);
            const techRecordWrapper: ITechRecordWrapper = JSON.parse(
              result.body
            );
            expect(techRecordWrapper.techRecord[0].historicPrimaryVrm).toEqual(techRecord.primaryVrm);
            expect(techRecordWrapper.techRecord[0].historicSecondaryVrms).toEqual(techRecord.secondaryVrms);
          });
      });
    }
  );
});

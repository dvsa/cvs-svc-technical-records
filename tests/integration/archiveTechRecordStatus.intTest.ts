import LambdaTester from "lambda-tester";
import { cloneDeep } from "lodash";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import { STATUS } from "../../src/assets/Enums";
import { archiveTechRecordStatus } from "../../src/functions/archiveTechRecordStatus";
import HTTPResponse from "../../src/models/HTTPResponse";
import mockData from "../resources/technical-records.json";
import { emptyDatabase, populateDatabase } from "../util/dbOperations";

const msUserDetails = {
  msUser: "dorel",
  msOid: "1234545",
};

describe("archiveTechRecordStatus", () => {
  beforeAll(async () => {
    jest.restoreAllMocks();
  });
  beforeEach(async () => {
    await populateDatabase();
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
          techRecord: techRecord.techRecord,
        };
        expect.assertions(3);
        await LambdaTester(archiveTechRecordStatus)
          .event({
            path: `/vehicles/archive/${systemNumber}`,
            pathParameters: {
              systemNumber,
            },
            queryStringParameters: {},
            body: payload,
            httpMethod: "PUT",
            resource: "/vehicles/archive/{systemNumber}",
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toBe(200);
            const techRecordWrapper: ITechRecordWrapper = JSON.parse(
              result.body
            );
            expect(techRecordWrapper.techRecord[0].statusCode).toBe(
              STATUS.ARCHIVED
            );
            expect(techRecordWrapper.techRecord[0].notes).toBe("string\nTest");
          });
      });
      it("should populate the historic vrm's", async () => {
        const systemNumber: string = "11000009";
        const techRecord: any = cloneDeep(mockData[8]);
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

  context(
    "when trying to update a non archived vehicle tech record status to archived for multiple returned rows",
    () => {
      it("should update the status on the correct record and set audit details", async () => {
        const systemNumber: string = "11220280";
        const techRecord: any = cloneDeep(mockData[171]);
        const payload = {
          vin: techRecord.vin,
          reasonForArchiving: "Test",
          systemNumber: techRecord.systemNumber,
          primaryVrm: techRecord.primaryVrm,
          msUserDetails,
          techRecord: techRecord.techRecord,
        };
        expect.assertions(3);
        await LambdaTester(archiveTechRecordStatus)
          .event({
            path: `/vehicles/archive/${systemNumber}`,
            pathParameters: {
              systemNumber,
            },
            queryStringParameters: {},
            body: payload,
            httpMethod: "PUT",
            resource: "/vehicles/archive/{systemNumber}",
          })
          .expectResolve((result: any) => {
            expect(result.statusCode).toBe(200);
            const techRecordWrapper: ITechRecordWrapper = JSON.parse(
              result.body
            );
            expect(techRecordWrapper.techRecord[0].statusCode).toBe(
              STATUS.ARCHIVED
            );
            expect(techRecordWrapper.techRecord[0].notes).toBe(" \nTest");
          });
      });
    }
  );

  context("when trying to archive a tech record", () => {
    context("and the record is already archived", () => {
      it("should return 400 status", async () => {
        const { systemNumber, vin, primaryVrm, techRecord } = cloneDeep(mockData[137]);
        const payload = {vin, systemNumber, primaryVrm, msUserDetails, techRecord, reasonForArchiving: "unhappy test"};

        expect.assertions(2);
        await LambdaTester(archiveTechRecordStatus)
          .event({
            path: `/vehicles/archive/${systemNumber}`,
            pathParameters: { systemNumber },
            queryStringParameters: {},
            body: payload,
            httpMethod: "PUT",
            resource: "/vehicles/archive/{systemNumber}",
          })
          .expectResolve((result: HTTPResponse) => {
            expect(result.statusCode).toBe(400);
            expect(JSON.parse(result.body)).toEqual({errors:["You are not allowed to update an archived tech-record"]});
          });
      });
    });

    context("and there are more than one matched records", () => {
      it("should return 500 status", async () => {
        const { systemNumber, vin, primaryVrm, techRecord } = cloneDeep(mockData[170]);
        const payload = {vin, systemNumber, primaryVrm, msUserDetails, techRecord, reasonForArchiving: "unhappy test"};

        expect.assertions(2);
        await LambdaTester(archiveTechRecordStatus)
          .event({
            path: `/vehicles/archive/${systemNumber}`,
            pathParameters: { systemNumber },
            queryStringParameters: {},
            body: payload,
            httpMethod: "PUT",
            resource: "/vehicles/archive/{systemNumber}",
          })
          .expectResolve((result: HTTPResponse) => {
            expect(result.statusCode).toBe(500);
            expect(JSON.parse(result.body)).toEqual({errors: ["Failed to uniquely identify record"]});
          });
      });
    });
  });
});

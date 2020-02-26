import TechRecordsService from "../../src/services/TechRecordsService";
import HTTPError from "../../src/models/HTTPError";
import techRecords from "../resources/technical-records.json";
import {HTTPRESPONSE} from "../../src/assets/Enums";
import S3BucketService from "../../src/services/S3BucketService";
import S3 from "aws-sdk/clients/s3";

jest.mock("../../src/services/S3BucketService");
jest.mock("aws-sdk/clients/s3");
const s3BucketServiceMock = new S3BucketService(new S3());
const recordIds = techRecords.map((record) => [record.partialVin, record.vin]) as string[][];

describe("deleteTechRecordsList", () => {
  context("database call deletes items", () => {
    it("should return nothing", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          deleteMultiple: () => {
            return Promise.resolve({UnprocessedItems: undefined});
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      const data: any = await techRecordsService.deleteTechRecordsList(recordIds);
      expect(data).toEqual(undefined);
    });

    it("should return the unprocessed items", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          deleteMultiple: () => {
            return Promise.resolve({UnprocessedItems: [{}, {}, {}]});
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      const data: any = await techRecordsService.deleteTechRecordsList(recordIds);
      expect(data.length).toEqual(3);
    });
  });

  context("database call fails deleting items", () => {
    it("should return error 500", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          deleteMultiple: () => {
            return Promise.reject();
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO, s3BucketServiceMock);

      try {
        expect(await techRecordsService.deleteTechRecordsList(recordIds)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(500);
        expect(errorResponse.body).toEqual(HTTPRESPONSE.INTERNAL_SERVER_ERROR);
      }
    });
  });
});

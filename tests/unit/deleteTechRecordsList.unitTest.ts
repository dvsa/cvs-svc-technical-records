import TechRecordsService from "../../src/services/TechRecordsService";
import HTTPError from "../../src/models/HTTPError";
import techRecords from "../resources/technical-records.json";

const recordIds = techRecords.map((record) => [record.partialVin, record.vin]);

describe("deleteTechRecordsList", () => {
  context("database call deletes items", () => {
    it("should return nothing", () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          deleteMultiple: () => {
            return Promise.resolve({ UnprocessedItems: undefined });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      return techRecordsService.deleteTechRecordsList(recordIds)
        .then((data: any) => {
          expect(data).toEqual(undefined);
        });
    });

    it("should return the unprocessed items", () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          deleteMultiple: () => {
            return Promise.resolve({ UnprocessedItems: [{}, {}, {}] });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      return techRecordsService.deleteTechRecordsList(recordIds)
        .then((data: any) => {
          expect(data.length).toEqual(3);
        });
    });
  });

  context("database call fails deleting items", () => {
    it("should return error 500", () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          deleteMultiple: () => {
            return Promise.reject();
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      return techRecordsService.deleteTechRecordsList(recordIds)
        .catch((errorResponse: any) => {
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.statusCode).toEqual(500);
          expect(errorResponse.body).toEqual("Internal Server Error");
        });
    });
  });
});

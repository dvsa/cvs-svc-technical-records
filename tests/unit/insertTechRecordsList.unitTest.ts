import TechRecordsService from "../../src/services/TechRecordsService";
import HTTPError from "../../src/models/HTTPError";
import records from "../resources/technical-records.json";
import ITechRecord from "../../@Types/ITechRecord";

describe("insertTechRecordsList", () => {
  context("database call inserts items", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should return the unprocessed items", () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createMultiple: () => {
            return Promise.resolve({ UnprocessedItems: records });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      return techRecordsService.insertTechRecordsList(records)
          .then((data: ITechRecord[]) => {
            expect(data.length).toEqual(21);
          });
    });

    it("should return nothing", () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createMultiple: () => {
            return Promise.resolve({UnprocessedItems: undefined});
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      // @ts-ignore //Required because it decided records was different from the last time it was used otherwise
      return techRecordsService.insertTechRecordsList(records)
          .then((data: ITechRecord[]) => {
            expect(data).toEqual(undefined);
          });
    });


  });

  context("database call fails inserting items", () => {
    it("should return error 500", () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createMultiple: () => {
            return Promise.reject("Bad things");
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      // @ts-ignore
      return techRecordsService.insertTechRecordsList(records)
        .catch((errorResponse: any) => {
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.statusCode).toEqual(500);
          expect(errorResponse.body).toEqual("Internal Server Error");
        });
    });
  });
});

import TechRecordsService from "../../src/services/TechRecordsService";
import HTTPError from "../../src/models/HTTPError";
import records from "../resources/technical-records.json";
import ITechRecord from "../../@Types/ITechRecord";
import instantiate = WebAssembly.instantiate;
import {HTTPRESPONSE} from "../../src/assets/Enums";

describe("insertTechRecordsList", () => {
  context("database call inserts items", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should return the unprocessed items", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createMultiple: () => {
            return Promise.resolve({UnprocessedItems: records});
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      // @ts-ignore
      const data: ITechRecord[] = await techRecordsService.insertTechRecordsList(records);
      expect(data.length).toEqual(30);
    });

    it("should return nothing", async () => {
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
      const data: ITechRecord[] = await techRecordsService.insertTechRecordsList(records);
      expect(data).toEqual(undefined);
    });
  });

  context("database call fails inserting items", () => {
    it("should return error 500", async () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          createMultiple: () => {
            return Promise.reject("Bad things");
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      try {
        // @ts-ignore
        expect(await techRecordsService.insertTechRecordsList(records)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(500);
        expect(errorResponse.body).toEqual(HTTPRESPONSE.INTERNAL_SERVER_ERROR);
      }
    });
  });
});

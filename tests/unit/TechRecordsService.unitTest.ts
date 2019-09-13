/* global describe context it */
import {expect} from "chai";

// import TechRecordsDAOMock from "../models/TechRecordsDAOMock";
import TechRecordsService from "../../src/services/TechRecordsService";
import HTTPError from "../../src/models/HTTPError";
import records from "../resources/technical-records.json";

describe("getTechRecordsList", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  context("when db call returns data", () => {
    it("should return a populated response", () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: [records[0]],
              Count: 1,
              ScannedCount: 1
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);


      return techRecordsService.getTechRecordsList("1B7GG36N12S678410", "current")
        .then((returnedRecords: any) => {
          expect(returnedRecords).to.not.equal(undefined);
          expect(returnedRecords).to.not.equal({});
          expect(returnedRecords).to.equal(records[0]);
        });
    });
  });

  context("when db returns empty data", () => {
    it("should return 404-No resources match the search criteria", () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: {},
              Count: 0,
              ScannedCount: 0
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      return techRecordsService.getTechRecordsList("Rhubarb", "Potato")
        .then(() => {
          expect.fail();
        }).catch((errorResponse: any) => {
          expect(errorResponse).to.be.instanceOf(HTTPError);
          expect(errorResponse.statusCode).to.equal(404);
          expect(errorResponse.body).to.equal("No resources match the search criteria.");
        });
    });
  });
  context("when db return undefined data", () => {
    it("should return 404-No resources match the search criteria if db return null data", () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: undefined,
              Count: 0,
              ScannedCount: 0
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      return techRecordsService.getTechRecordsList("", "")
        .then(() => {
          expect.fail();
        }).catch((errorResponse: any) => {
          expect(errorResponse).to.be.instanceOf(HTTPError);
          expect(errorResponse.statusCode).to.equal(404);
          expect(errorResponse.body).to.equal("No resources match the search criteria.");
        });
    });
  });

  context("when db does not return response", () => {
    it("should return 500-Internal Server Error", () => {
      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.reject({
              Items: undefined,
              Count: 0,
              ScannedCount: 0
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      return techRecordsService.getTechRecordsList("", "")
        .then(() => {
          expect.fail();
        })
        .catch((errorResponse: any) => {
          expect(errorResponse).to.be.instanceOf(HTTPError);
          expect(errorResponse.statusCode).to.be.equal(500);
          expect(errorResponse.body).to.equal("Internal Server Error");
        });
    });
  });

  context("when db returns too many results", () => {
    it("should return 422 - More Than One Match", () => {

      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: undefined,
              Count: 2,
              ScannedCount: 2
            });
          }
        };
      });
      const mockDAO = new MockDAO();
      const techRecordsService = new TechRecordsService(mockDAO);

      return techRecordsService.getTechRecordsList("", "")
        .then(() => {
          expect.fail();
        }).catch((errorResponse: any) => {
          expect(errorResponse).to.be.instanceOf(HTTPError);
          expect(errorResponse.statusCode).to.equal(422);
          expect(errorResponse.body).to.equal("The provided partial VIN returned more than one match.");
        });
    });
  });
});

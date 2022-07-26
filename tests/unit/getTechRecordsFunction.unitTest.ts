import {getTechRecords} from "../../src/functions/getTechRecords";
import TechRecordsService from "../../src/services/TechRecordsService";
import {HTTPRESPONSE} from "../../src/assets";
import HTTPError from "../../src/models/HTTPError";
jest.mock("../../src/services/TechRecordsService");

describe("getTechRecords Function", () => {
  describe("parsing query parameters", () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });
    describe("missing query params", () => {
      const event = {
        pathParameters: {
          searchIdentifier: "XMGDE02FS0H012345"
        },
      };
      const mock = jest.fn().mockResolvedValue([]);
      TechRecordsService.prototype.getTechRecordsList = mock;
      getTechRecords(event);
      it("defaults missing searchCriteria to ALL", () => {
        expect(mock.mock.calls[0][2]).toEqual("all");
      });
      it("defaults missing status to PROVISIONAL_OVER_CURRENT", () => {
        expect(mock.mock.calls[0][1]).toEqual("provisional_over_current");
      });
    });

    describe("with individual params", () => {
      it("passes on specified searchCriteria value", () => {
        const event = {
          pathParameters: {
            searchIdentifier: "XMGDE02FS0H012345"
          },
          queryStringParameters: {
            searchCriteria: "vrm"
          }
        };
        const mock = jest.fn().mockResolvedValue([]);
        TechRecordsService.prototype.getTechRecordsList = mock;
        getTechRecords(event);
        expect(mock.mock.calls[0][2]).toEqual("vrm");
      });
      it("passes on specified status value", () => {
        const event = {
          pathParameters: {
            searchIdentifier: "XMGDE02FS0H012345"
          },
          queryStringParameters: {
            status: "current"
          }
        };
        const mock = jest.fn().mockResolvedValue([]);
        TechRecordsService.prototype.getTechRecordsList = mock;
        getTechRecords(event);
        expect(mock.mock.calls[0][1]).toEqual("current");
      });
    });
    describe("with multiple params", () => {
      it("passes on specified searchCriteria and status value", () => {
        const event = {
          pathParameters: {
            searchIdentifier: "XMGDE02FS0H012345"
          },
          queryStringParameters: {
            searchCriteria: "searchOption",
            status: "rhubarb"
          }
        };
        const mock = jest.fn().mockResolvedValue([]);
        TechRecordsService.prototype.getTechRecordsList = mock;
        getTechRecords(event);
        expect(mock.mock.calls[0][1]).toEqual("rhubarb");
        expect(mock.mock.calls[0][2]).toEqual("searchOption");
      });
    });

    describe("missing path param", () => {
      it("should trigger validation when path parameter search identifier is null", () => {
        const event = {
          pathParameters: {
            searchIdentifier: null
          },
        };
        const mock = jest.fn().mockResolvedValue([]);
        TechRecordsService.prototype.getTechRecordsList = mock;
        const result = getTechRecords(event);
        expect(mock).not.toBeCalled();
        result.catch((x) => {
          expect(x).toBeInstanceOf(HTTPError);
          expect(x.statusCode).toEqual(400);
          expect(x.body).toEqual(JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS));
        });
      });
      it("should trigger validation when path parameter search identifier is empty string", () => {
        const event = {
          pathParameters: {
            searchIdentifier: " "
          },
        };
        const mock = jest.fn().mockResolvedValue([]);
        TechRecordsService.prototype.getTechRecordsList = mock;
        const result = getTechRecords(event);
        expect(mock).not.toBeCalled();
        result.catch((x) => {
          expect(x).toBeInstanceOf(HTTPError);
          expect(x.statusCode).toEqual(400);
          expect(x.body).toEqual(JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS));
        });
      });
      it("should trigger validation when path parameter search identifier is undefined", () => {
        const event = {
          pathParameters: {
            searchIdentifier: undefined
          },
        };
        const mock = jest.fn().mockResolvedValue([]);
        TechRecordsService.prototype.getTechRecordsList = mock;
        const result = getTechRecords(event);
        expect(mock).not.toBeCalled();
        result.catch((x) => {
          expect(x).toBeInstanceOf(HTTPError);
          expect(x.statusCode).toEqual(400);
          expect(x.body).toEqual(JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS));
        });
      });
      it("should trigger validation when path parameter is null", () => {
        const event = {
          pathParameters: null,
        };
        const mock = jest.fn().mockResolvedValue([]);
        TechRecordsService.prototype.getTechRecordsList = mock;
        const result = getTechRecords(event);
        expect(mock).not.toBeCalled();
        result.catch((x) => {
          expect(x).toBeInstanceOf(HTTPError);
          expect(x.statusCode).toEqual(400);
          expect(x.body).toEqual(JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS));
        });
      });
    });
  });
});

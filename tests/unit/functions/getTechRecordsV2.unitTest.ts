import {getTechRecordsV2} from "../../../src/functions/getTechRecordsV2";
import TechRecordsService from "../../../src/services/TechRecordsService";
jest.mock("../../../src/services/TechRecordsService");

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
      getTechRecordsV2(event);
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
        getTechRecordsV2(event);
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
        getTechRecordsV2(event);
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
        getTechRecordsV2(event);
        expect(mock.mock.calls[0][1]).toEqual("rhubarb");
        expect(mock.mock.calls[0][2]).toEqual("searchOption");
      });
    });
  });
});

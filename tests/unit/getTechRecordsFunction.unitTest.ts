import {getTechRecords} from "../../src/functions/getTechRecords";
import TechRecordsService from "../../src/services/TechRecordsService";
jest.mock("../../src/services/TechRecordsService");

describe("getTechRecords Function", () => {
  describe("parsing query parameters", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it("defaults missing searchCriteria to ALL", () => {
      const event = {
        pathParameters: {
          searchIdentifier: "XMGDE02FS0H012345"
        },
        queryStringParameters: {
          status: "current",
          metadata: "true"
        }
      };
      const mock = jest.fn().mockResolvedValue([]);
      TechRecordsService.prototype.getTechRecordsList = mock;
      getTechRecords(event);
      expect(mock.mock.calls[0]).toContain("all");
    });

    it("passes on specified searchCriteria value", () => {
      const event = {
        pathParameters: {
          searchIdentifier: "XMGDE02FS0H012345"
        },
        queryStringParameters: {
          status: "current",
          metadata: "true",
          searchCriteria: "vrm"
        }
      };
      const mock = jest.fn().mockResolvedValue([]);
      TechRecordsService.prototype.getTechRecordsList = mock;
      getTechRecords(event);
      expect(mock.mock.calls[0]).toContain("vrm");
    });
  });
});

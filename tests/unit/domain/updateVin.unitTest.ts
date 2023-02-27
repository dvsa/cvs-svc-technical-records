import {
  updateVin,
  validateParameters,
  validateVins,
} from "../../../src/functions/updateVin";
import { TechRecordsListHandler } from "../../../src/handlers/TechRecordsListHandler";
import TechRecordsDAO from "../../../src/models/TechRecordsDAO";
import records from "../../resources/technical-records.json";
jest.mock("../../../src/handlers/TechRecordsListHandler");
jest.mock("../../../src/models/TechRecordsDAO");

describe("updateVin", () => {
  context("when the event parameter are valid, trying to update vin", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    const testVehicleIndex = records.findIndex(
      (v) => v.systemNumber === "3506666" && v.vin === "XXB6703742N122212"
    );
    it("returns a 200 status code", async () => {
      const mockTechRecordListHandler = jest
        .fn()
        .mockResolvedValue([records[testVehicleIndex]]);
      TechRecordsListHandler.prototype.getTechRecordList =
        mockTechRecordListHandler;
      const mockUpdateVin = jest.fn().mockResolvedValue(true);
      TechRecordsDAO.prototype.updateVin = mockUpdateVin;
      const event = {
        pathParameters: {
          systemNumber: "3506666",
        },
        body: {
          msUserDetails: { msOid: "someId", msUser: "Test User" },
          newVin: "someNewVin00010",
        },
      };

      const response = await updateVin(event);

      expect(mockTechRecordListHandler.mock.calls[0][0]).toBe("3506666");
      expect(mockTechRecordListHandler.mock.calls[0][1]).toBe("all");
      expect(mockTechRecordListHandler.mock.calls[0][2]).toBe("systemNumber");
      expect(response.statusCode).toBe(200);
    });

    context("and there are no unique records", () => {
      it("returns a 500 status code", async () => {
        const mockTechRecordListHandler = jest.fn().mockResolvedValue([]);
        TechRecordsListHandler.prototype.getTechRecordList =
          mockTechRecordListHandler;
        const event = {
          pathParameters: {
            systemNumber: "3506666",
          },
          body: {
            msUserDetails: { msOid: "someId", msUser: "Test User" },
            newVin: "someNewVin00010",
          },
        };

        const response = await updateVin(event);

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual(
          JSON.stringify({
            errors: ["Failed to uniquely identify record"],
          })
        );
      });
    });

    context("a non HTTPError error is caught", () => {
      it("returns a 500 status code", async () => {
        const mockTechRecordListHandler = jest.fn().mockRejectedValue(false);
        TechRecordsListHandler.prototype.getTechRecordList =
          mockTechRecordListHandler;
        const event = {
          pathParameters: {
            systemNumber: "3506666",
          },
          body: {
            msUserDetails: { msOid: "someId", msUser: "Test User" },
            newVin: "someNewVin00010",
          },
        };

        const response = await updateVin(event);

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual('"Internal Server Error"');
      });
    });
  });
});

describe("Validate vins", () => {
  context("should throw error if", () => {
    it("new vin and old vin match", () => {
      const oldVin = "ABC123";
      const newVin = "ABC123";
      expect(() => validateVins(oldVin, newVin)).toThrowError();
    });
    it("new vin is too short", () => {
      const oldVin = "ABC123";
      const newVin = "1";
      expect(() => validateVins(oldVin, newVin)).toThrowError();
    });
    it("new vin is empty string", () => {
      const oldVin = "ABC123";
      const newVin = "";
      expect(() => validateVins(oldVin, newVin)).toThrowError();
    });
    it("new vin is too long", () => {
      const oldVin = "ABC123";
      const newVin = "ABC123NBDMNLCKPOSONDLKDJKDLKSJDIC34534533";
      expect(() => validateVins(oldVin, newVin)).toThrowError();
    });
  });
  context("should succeed if", () => {
    it("new vin and old vin are valid", () => {
      const oldVin = "ABC123";
      const newVin = "123ABC";
      expect(() => validateVins(oldVin, newVin)).toBeTruthy();
    });
  });
});

describe("Validate parameters", () => {
  context("should succeed if", () => {
    const event = {
      pathParameters: { systemNumber: "1000000" },
      body: {
        newVin: "123ABC",
        msUserDetails: { msUser: "Sean", msOid: "12345" },
      },
    };
    it("all details are valid", () => {
      expect(() => validateParameters(event)).toBeTruthy();
    });
  });
  context("should throw error if", () => {
    it("path parameters are absent", () => {
      const event = {
        body: {
          newVin: "123ABC",
          msUserDetails: { msUser: "Sean", msOid: "12345" },
        },
      };
      expect(() => validateParameters(event)).toThrowError();
    });
    it("body is absent", () => {
      const event = {
        pathParameters: { systemNumber: "1000000" },
      };
      expect(() => validateParameters(event)).toThrowError();
    });
    it("user name is empty", () => {
      const event = {
        pathParameters: { systemNumber: "1000000" },
        body: {
          newVin: "123ABC",
          msUserDetails: { msUser: "", msOid: "12345" },
        },
      };
      expect(() => validateParameters(event)).toThrowError();
    });
    it("user ID is empty", () => {
      const event = {
        pathParameters: { systemNumber: "1000000" },
        body: {
          newVin: "123ABC",
          msUserDetails: { msUser: "Sean", msOid: "" },
        },
      };
      expect(() => validateParameters(event)).toThrowError();
    });
    it("system number is empty", () => {
      const event = {
        pathParameters: { systemNumber: "" },
        body: {
          newVin: "123ABC",
          msUserDetails: { msUser: "Sean", msOid: "12345" },
        },
      };
      expect(() => validateParameters(event)).toThrowError();
    });
  });
});

describe("updateVin ", () => {
  context("should succeed if", () => {
    it("event is valid", () => {
      const event = {
        pathParameters: { systemNumber: "1000000" },
        body: {
          newVin: "123ABC",
          msUserDetails: { msUser: "Sean", msOid: "12345" },
        },
      };
      expect(() => updateVin(event)).toBeTruthy();
    });
  });
});

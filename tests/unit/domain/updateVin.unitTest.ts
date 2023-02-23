import {
  validateVins,
  validateParameters,
  updateVin,
} from "../../../src/functions/updateVin";

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
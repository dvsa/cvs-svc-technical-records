import { validateVins } from "../../../src/functions/updateVin";

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
});

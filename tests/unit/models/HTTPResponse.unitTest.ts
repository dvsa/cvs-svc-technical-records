import HTTPResponse from "../../../src/models/HTTPResponse";

describe("HTTP Response", () => {
  describe("when passed headers", () => {
    it("should add them to the list of headers", () => {
      const myHeaders = {aHeader: "aValue"};
      const output = new HTTPResponse(418, {}, myHeaders);
      expect(output.headers.aHeader).toBeTruthy();
      expect(Object.keys(output.headers)).toHaveLength(6);
      expect(output.statusCode).toEqual(418);
    });
  });

  describe("when passed headers", () => {
    it("should still add other headers", () => {
      const output = new HTTPResponse(418, {}, undefined);
      expect(Object.keys(output.headers)).toHaveLength(5);
      expect(output.statusCode).toEqual(418);
    });
  });
});

import HTTPError from "../../src/models/HTTPError";

describe("HTTP Error", () => {
  describe("when passed content", () => {
    it("Stores that content", () => {
      const output = new HTTPError(418, "a thing");
      expect(output.statusCode).toEqual(418);
      expect(output.body).toEqual("a thing");
    });
  });
});

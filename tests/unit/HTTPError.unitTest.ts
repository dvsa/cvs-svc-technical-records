import HTTPError from "../../src/models/HTTPError";
import {expect} from "chai";

describe("HTTP Error", () => {
    describe("when passed content", () => {
        it("Stores that content", () => {
            const output = new HTTPError(418, "a thing");
            expect(output.statusCode).to.equal(418);
            expect(output.body).to.equal("a thing");
        });
    });
});

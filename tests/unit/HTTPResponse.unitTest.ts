import HTTPResponse from "../../src/models/HTTPResponse";
import {expect} from "chai";

describe("HTTP Response", () => {
    describe("when passed headers", () => {
        it("should add them to the list of headers", () => {
            const myHeaders = {aHeader: "aValue"};
            const output = new HTTPResponse(418, {}, myHeaders);
            expect(output.headers.aHeader).to.exist;
            expect(Object.keys(output.headers)).to.have.length(6);
            expect(output.statusCode).to.equal(418);
        });
    });

    describe("when passed headers", () => {
        it("should still add other headers", () => {
            const output = new HTTPResponse(418, {}, undefined);
            expect(Object.keys(output.headers)).to.have.length(5);
            expect(output.statusCode).to.equal(418);
        });
    });
});

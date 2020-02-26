/* global describe context it */
import {validateInvocationResponse} from "../../src/utils/validateInvocationResponse";

describe("validateInvocationResponse", () => {

  context("when response payload is missing", () => {
    it("should throw an error", () => {
      try {
        validateInvocationResponse({
          Payload: "",
          StatusCode: 300
        });
      } catch (error) {
        expect(error.statusCode).toEqual(300);
        expect(error.body).toEqual(`Lambda invocation returned error: ${error.statusCode} with empty payload.`);
      }
    });
  });

  context("when payload is not a valid JSON", () => {
    it("should throw a 500 error", () => {
      try {
        validateInvocationResponse({
          Payload: '{"headers:123}',
          StatusCode: 500
        });
      } catch (error) {
        expect(error.statusCode).toEqual(500);
        expect(error.body).toEqual('Lambda invocation returned bad data: {"headers:123}');
      }
    });
  });

  context("when payload status code is >= 400", () => {
    it("should throw an error", () => {
      try {
        validateInvocationResponse({
          StatusCode: 404,
          Payload: '{"statusCode":404,"body":"No resources match the search criteria"}'
        });
      } catch (error) {
        expect(error.statusCode).toEqual(404);
        expect(error.body).toEqual("Lambda invocation returned error: 404 No resources match the search criteria");
      }
    });
  });

  context("when payload is valid", () => {
    it("should return the payload parsed", () => {
      const parsedPayload = validateInvocationResponse({
        StatusCode: 200,
        Payload: '{"statusCode":200,"body":"{}"}'
      });
      expect(parsedPayload.statusCode).toEqual(200);
    });
  });
});

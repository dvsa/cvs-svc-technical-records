import AWS from "aws-sdk";

import {LambdaService} from "../../../src/services/LambdaService";

describe("LambdaService", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("invoke function", () => {
    const invokeMock = jest.fn();
    // @ts-ignore
    jest.spyOn(AWS, "Lambda").mockImplementation(() => {
      return {
        invoke: invokeMock
      };
    });

    const lambdaEvent = {foo: "bar"};
    invokeMock.mockReturnValueOnce({
      promise: () => Promise.resolve({Payload: '{"body": {"foo": "bar"}, "statusCode": 200}', StatusCode: 200})
    });

    it("should the right event and return response value", (done) => {
      // @ts-ignore
      LambdaService.invoke("something", lambdaEvent).then((data) => {
        expect(data).toEqual(lambdaEvent);
        expect(invokeMock.mock.calls[0][0]).toEqual({
          FunctionName: "something",
          InvocationType: "RequestResponse",
          Payload: '{"foo":"bar"}'
        });
      });
      done();

    });

  });
});

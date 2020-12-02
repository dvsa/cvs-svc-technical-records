/* tslint:disable */
let AWS: any;
if (process.env._X_AMZN_TRACE_ID) {
  AWS = require("aws-xray-sdk").captureAWS(require("aws-sdk"));
} else {
  console.log("Serverless Offline detected; skipping AWS X-Ray setup");
  AWS = require("aws-sdk");
}
/* tslint:enable */
import Configuration from "../utils/Configuration";
import {validateInvocationResponse} from "../utils/validateInvocationResponse";


const lambdaInvokeEndpoints = Configuration.getInstance().getEndpoints();

/**
 * Helper service for interactions with other lambdas
 */
export class LambdaService {
  public static invoke(lambdaName: any, lambdaEvent: any) {
    const lambda = new AWS.Lambda(lambdaInvokeEndpoints.params);

    return lambda.invoke({
      FunctionName: lambdaName,
      InvocationType: "RequestResponse",
      Payload: JSON.stringify(lambdaEvent)
    })
    .promise()
      .then((data: any) => {
        const payload = validateInvocationResponse(data);
        const body = JSON.parse(payload.body);
        return body;
      });
  }
}

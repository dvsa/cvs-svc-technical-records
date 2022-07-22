import Path from 'path-parser';
import Configuration from './utils/Configuration';
import HTTPResponse from './models/HTTPResponse';
import {Context} from "aws-lambda";
import {IFunctions} from "../@Types/Configuration";

const handler = async (event: any, context: Context) => {
  console.info(JSON.stringify(event));

  // Request integrity checks
  if (!event) {
    return new HTTPResponse(400, 'AWS event is empty. Check your test event.')
  }

  if (event.body) {
    let payload = {}

    try {
      payload = JSON.parse(event.body)
    } catch (e) {
      return new HTTPResponse(400, 'Body is not a valid JSON.')
    }

    Object.assign(event, { body: payload })
  }

  // Finding an appropriate λ matching the request
  const config = Configuration.getInstance()
  const functions = config.getFunctions()
  const serverlessConfig = config.getConfig().serverless

  const matchingLambdaEvents = functions.filter((fn: IFunctions) => {
    // Find λ with matching httpMethod
    return event.httpMethod === fn.method
  })
    .filter((fn: IFunctions) => {
      // Find λ with matching path
      const localPath = new Path(fn.path)
      const remotePath = new Path(`${serverlessConfig.basePath}${fn.path}`) // Remote paths also have environment

      return (localPath.test(event.path) || remotePath.test(event.path))
    })

  // Exactly one λ should match the above filtering.
  if (matchingLambdaEvents.length === 1) {
    const lambdaEvent = matchingLambdaEvents[0]
    const lambdaFn = lambdaEvent.function

    const localPath = new Path(lambdaEvent.path)
    const remotePath = new Path(`${serverlessConfig.basePath}${lambdaEvent.path}`) // Remote paths also have environment

    const lambdaPathParams = (localPath.test(event.path) || remotePath.test(event.path))

    Object.assign(event, { pathParameters: lambdaPathParams })

    console.log(`HTTP ${event.httpMethod} ${event.path} -> λ ${lambdaEvent.name}`)

    // Explicit conversion because typescript can't figure it out
    return lambdaFn(event, context)
  }

  // If filtering results in less or more λ functions than expected, we return an error.
  console.error(`Error: Route ${event.httpMethod} ${event.path} was not found.
    Dumping event:
    ${JSON.stringify(event)}
    Dumping context:
    ${JSON.stringify(context)}`)

  return new HTTPResponse(400, { error: `Route ${event.httpMethod} ${event.path} was not found.` })
}

export {handler};

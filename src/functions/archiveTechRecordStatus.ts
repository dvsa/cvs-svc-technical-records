import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import {ERRORS} from "../assets/Enums";
import {formatErrorMessage} from "../utils/formatErrorMessage";
// import {Vehicle, TechRecord} from "../../@Types/TechRecords";
import Configuration from "../utils/Configuration";
import AWS from "aws-sdk";

export async function archiveTechRecordStatus(event: any) {
  const dbConfig = Configuration.getInstance().getDynamoDBConfig();
  const dbClient = new AWS.DynamoDB.DocumentClient(dbConfig.params);
  const techRecordsService = new TechRecordsService(new TechRecordsDAO(dbClient, dbConfig));

  const systemNumber: string = event.pathParameters.systemNumber;
  const techRec = event.body && event.body.techRecord;
  const msUserDetails = event.body && event.body.msUserDetails ? event.body.msUserDetails : null;

  if (!techRec || !techRec.length) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage(ERRORS.MISSING_PAYLOAD)));
  }
  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage(ERRORS.MISSING_USER)));
  }

  const techRecord = {
    vin: "",
    systemNumber,
    techRecord: techRec
  };

  return techRecordsService.archiveTechRecordStatus(systemNumber, techRecord, msUserDetails)
    .then((updatedTechRec: any) => {
      return new HTTPResponse(200, updatedTechRec);
    })
    .catch((error: any) => {
      console.log(error);
      return new HTTPResponse(error.statusCode, error.body);
    });
}

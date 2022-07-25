import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import IMsUserDetails from "../../@Types/IUserDetails";
import {formatErrorMessage} from "../utils/formatErrorMessage";
import Configuration from "../utils/Configuration";
import AWS from "aws-sdk";

const addProvisionalTechRecord = async (event: any) => {
  const dbConfig = Configuration.getInstance().getDynamoDBConfig();
  const dbClient = new AWS.DynamoDB.DocumentClient(dbConfig.params);
  const techRecordsService = new TechRecordsService(new TechRecordsDAO(dbClient, dbConfig));

  const sysNum: string = event.pathParameters.systemNumber;
  const techRec = event.body ? event.body.techRecord : null;
  const msUserDetails: IMsUserDetails = event.body ? event.body.msUserDetails : null;

  if (!techRec || !techRec.length) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage("Body is not a valid TechRecord")));
  }

  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage("Microsoft user details not provided")));
  }
  const techRecord = {
    vin: "",
    techRecord: techRec,
    systemNumber: sysNum
  };
  try {
    const addedProvisionalTechRecord = await techRecordsService.addProvisionalTechRecord(techRecord, msUserDetails);
    return new HTTPResponse(200, addedProvisionalTechRecord);
  } catch (error) {
    console.log(error);
    return new HTTPResponse(error.statusCode, error.body);
  }
};
export {addProvisionalTechRecord};

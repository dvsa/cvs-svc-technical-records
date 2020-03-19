import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {formatErrorMessage} from "../utils/formatErrorMessage";
import {ERRORS, STATUS} from "../assets/Enums";

const updateTechRecords = (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);

  const techRec = event.body ? event.body.techRecord : null;
  const msUserDetails = event.body ? event.body.msUserDetails : null;
  const systemNumber = event.pathParameters ? event.pathParameters.systemNumber : null;

  if (!systemNumber) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage("Invalid path parameter 'systemNumber'")));
  }

  if (!techRec || !techRec.length) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage("Body is not a valid TechRecord")));
  }

  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage(ERRORS.MISSING_USER)));
  }

  const oldStatusCodeString = event.queryStringParameters && event.queryStringParameters.oldStatusCode;
  const oldStatusCode = oldStatusCodeString ? STATUS[oldStatusCodeString.toUpperCase() as keyof typeof STATUS] : undefined;

  const techRecord: ITechRecordWrapper = {
    vin: event.body.vin,
    systemNumber,
    secondaryVrms: event.body.secondaryVrms,
    primaryVrm: event.body.primaryVrm,
    trailerId: event.body.trailerId,
    techRecord: techRec
  };
  return techRecordsService.updateTechRecord(techRecord, msUserDetails, oldStatusCode)
    .then((updatedTechRec: any) => {
      return new HTTPResponse(200, updatedTechRec);
    })
    .catch((error: any) => {
      console.log(error);
      return new HTTPResponse(error.statusCode, error.body);
    });
};

export {updateTechRecords};

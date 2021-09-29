import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import {formatErrorMessage} from "../utils/formatErrorMessage";
import {ERRORS, STATUS} from "../assets/Enums";

const updateTechRecords = async (event: any) => {
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

  const techRecord = {
    vin: event.body.vin,
    systemNumber,
    secondaryVrms: event.body.secondaryVrms,
    primaryVrm: event.body.primaryVrm,
    trailerId: event.body.trailerId,
    techRecord: techRec
  };
  try {
    const updatedTechRec = await techRecordsService.updateTechRecord(techRecord, msUserDetails, oldStatusCode);
    return new HTTPResponse(200, updatedTechRec);
  } catch (error) {
    console.error(error);
    return new HTTPResponse(error.statusCode, error.body);
  }
};

export {updateTechRecords};

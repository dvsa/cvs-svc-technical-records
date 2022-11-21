import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import {ERRORS} from "../assets/Enums";
import {formatErrorMessage} from "../utils/formatErrorMessage";
// import {Vehicle, TechRecord} from "../../@Types/TechRecords";

export async function archiveTechRecordStatus(event: any) {
  const techRecordsService = new TechRecordsService(new TechRecordsDAO());

  const systemNumber: string = event.pathParameters.systemNumber;
  const techRec = event.body && event.body.techRecord;
  const msUserDetails = event.body && event.body.msUserDetails ? event.body.msUserDetails : null;
  const reasonForArchiving = event.body && event.body.reasonForArchiving;

  if (!techRec || !techRec.length) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage(ERRORS.MISSING_PAYLOAD)));
  }
  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage(ERRORS.MISSING_USER)));
  }
  if(!reasonForArchiving) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage(ERRORS.MISSING_REASON_FOR_ARCHIVING)));
  }

  const techRecord = {
    vin: "",
    systemNumber,
    techRecord: techRec
  };

  return techRecordsService.archiveTechRecordStatus(systemNumber, techRecord, msUserDetails, reasonForArchiving)
    .then((updatedTechRec: any) => {
      return new HTTPResponse(200, updatedTechRec);
    })
    .catch((error: any) => {
      console.log(error);
      return new HTTPResponse(error.statusCode, error.body);
    });
}

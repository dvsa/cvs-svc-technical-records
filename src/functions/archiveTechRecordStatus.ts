import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import {ERRORS} from "../assets/Enums";
import {formatErrorMessage} from "../utils/formatErrorMessage";
import * as enums from "../assets/Enums";
// import {Vehicle, TechRecord} from "../../@Types/TechRecords";

export async function archiveTechRecordStatus(event: any) {
  const techRecordsService = new TechRecordsService(new TechRecordsDAO());

  const systemNumber: string = event.pathParameters.systemNumber;
  const techRec = event.body && event.body.techRecord;
  const msUserDetails = event.body && event.body.msUserDetails ? event.body.msUserDetails : null;

  if (!techRec || !techRec.length) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage(ERRORS.MISSING_PAYLOAD)));
  }
  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage(ERRORS.MISSING_USER)));
  }
  if (techRec.statusCode === enums.STATUS.ARCHIVED || techRec.statusCode === enums.STATUS.REMOVED) {
    return new HTTPResponse(400, enums.ERRORS.CANNOT_UPDATE_ARCHIVED_RECORD);
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

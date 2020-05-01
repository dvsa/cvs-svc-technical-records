import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {formatErrorMessage} from "../utils/formatErrorMessage";
import { ONLY_DIGITS_AND_NUMBERS, STATUS } from "../assets/Enums";

const updateTechRecords = (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);

  const techRec = event.body ? event.body.techRecord : null;
  const msUserDetails = event.body ? event.body.msUserDetails : null;
  const vin = event.pathParameters ? event.pathParameters.vin : null;

  if (!vin || !ONLY_DIGITS_AND_NUMBERS.test(vin) || vin.length < 3 || vin.length > 21) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage("Invalid path parameter 'vin'")));
  }

  if (!techRec || !techRec.length) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage("Body is not a valid TechRecord")));
  }

  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage("Microsoft user details not provided")));
  }
  const systemNumber = event.body ? event.body.systemNumber : null;
  const oldStatusCodeString =
    event.queryStringParameters && event.queryStringParameters.oldStatusCode;
  const oldStatusCode = oldStatusCodeString
    ? STATUS[oldStatusCodeString.toUpperCase() as keyof typeof STATUS]
    : undefined;

  if (
    !vin ||
    !ONLY_DIGITS_AND_NUMBERS.test(vin) ||
    vin.length < 3 ||
    vin.length > 21
  ) {
    return Promise.resolve(
      new HTTPResponse(400, "Invalid path parameter 'vin'")
    );
  }

  if (!techRec || !techRec.length) {
    return Promise.resolve(
      new HTTPResponse(400, "Body is not a valid TechRecord")
    );
  }

  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(
      new HTTPResponse(400, "Microsoft user details not provided")
    );
  }

  if (!systemNumber) {
    return Promise.resolve(new HTTPResponse(400, "System number not provided"));
  }

  const techRecord: ITechRecordWrapper = {
    vin,
    systemNumber: event.body.systemNumber,
    techRecord: techRec
  };
  return techRecordsService
    .updateTechRecord(techRecord, msUserDetails, oldStatusCode)
    .then((updatedTechRec: any) => {
      return new HTTPResponse(200, updatedTechRec);
    })
    .catch((error: any) => {
      console.log(error);
      return new HTTPResponse(error.statusCode, error.body);
    });
};

export { updateTechRecords };

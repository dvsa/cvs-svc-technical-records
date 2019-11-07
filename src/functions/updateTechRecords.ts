import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import ITechRecord from "../../@Types/ITechRecord";

const updateTechRecords = (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);
  const ONLY_DIGITS_AND_NUMBERS: RegExp = /^[A-Za-z0-9]+$/;

  const techRec = event.body ? event.body.techRecord : null;
  const msUserDetails = event.body ? event.body.msUserDetails : null;
  const vin = event.pathParameters.vin;
  const fileToUpload = event.body ? event.body.base64String : null;

  if (!vin || !ONLY_DIGITS_AND_NUMBERS.test(vin) || vin.length < 9) {
    return Promise.resolve(new HTTPResponse(400, "Invalid path parameter 'vin'"));
  }

  if (!techRec || !techRec.length) {
    return Promise.resolve(new HTTPResponse(400, "Body is not a valid TechRecord"));
  }

  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(new HTTPResponse(400, "Microsoft user details not provided"));
  }

  // TODO: validate payload for every type of vehicle(psv, hgv, trl) - will be done in a future ticket

  const techRecord = {
    vin,
    partialVin: vin.substr(vin.length - 6),
    techRecord: techRec
  };
  return techRecordsService.updateTechRecord(techRecord, msUserDetails, fileToUpload)
    .then((updatedTechRec: any) => {
      return new HTTPResponse(200, updatedTechRec);
    })
    .catch((error: any) => {
      console.log(error);
      return new HTTPResponse(error.statusCode, error.body);
    });

};

export {updateTechRecords};

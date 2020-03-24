import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";

const updateTechRecords = (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);
  const ONLY_DIGITS_AND_NUMBERS: RegExp = /^[A-Za-z0-9]+$/;

  const techRec = event.body ? event.body.techRecord : null;
  const msUserDetails = event.body ? event.body.msUserDetails : null;
  const vin = event.pathParameters ? event.pathParameters.vin : null;
  const systemNumber = event.body ? event.body.systemNumber : null;

  if (!vin || !ONLY_DIGITS_AND_NUMBERS.test(vin) || vin.length < 3 || vin.length > 21) {
    return Promise.resolve(new HTTPResponse(400, "Invalid path parameter 'vin'"));
  }

  if (!techRec || !techRec.length) {
    return Promise.resolve(new HTTPResponse(400, "Body is not a valid TechRecord"));
  }

  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(new HTTPResponse(400, "Microsoft user details not provided"));
  }

  if (!systemNumber) {
    return Promise.resolve(new HTTPResponse(400, "System number not provided"));
  }

  const techRecord: ITechRecordWrapper = {
    vin,
    systemNumber,
    techRecord: techRec
  };
  return techRecordsService.updateTechRecord(techRecord, msUserDetails)
    .then((updatedTechRec: any) => {
      return new HTTPResponse(200, updatedTechRec);
    })
    .catch((error: any) => {
      console.log(error);
      return new HTTPResponse(error.statusCode, error.body);
    });
};

export {updateTechRecords};

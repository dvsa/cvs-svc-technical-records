import { HTTPRESPONSE, VEHICLE_TYPE } from "../assets/Enums";
import HTTPResponse from "../models/HTTPResponse";
import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import { populatePartialVin } from "../utils/validations/ValidationUtils";

const postTechRecords = async (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);

  const techRec = event.body?.techRecord;
  const msUserDetails = event.body?.msUserDetails;
  const vin = event.body?.vin;
  const primaryVrm = event.body?.primaryVrm;
  const secondaryVrms = event.body?.secondaryVrms;
  const trailerId = event.body?.trailerId;

  if (!vin || vin.length < 3 || vin.length > 21 || typeof vin !== "string") {
    return Promise.resolve(new HTTPResponse(400, "Invalid body field 'vin'"));
  }

  if (!techRec || !techRec.length) {
    return Promise.resolve(new HTTPResponse(400, "Body is not a valid TechRecord"));
  }

  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(new HTTPResponse(400, "Microsoft user details not provided"));
  }

  const techRecord: any = {
    systemNumber: "",
    vin,
    partialVin: populatePartialVin(vin),
    primaryVrm,
    secondaryVrms,
    techRecord: techRec
  };

  // Only add the trailer id if we have it and vehicle is a trailer
  if (trailerId && techRec[0]?.vehicleType === VEHICLE_TYPE.TRL) {
    techRecord.trailerId = trailerId;
  }

  try {
    const data = await techRecordsService.insertTechRecord(techRecord, msUserDetails);
    return new HTTPResponse(201, HTTPRESPONSE.TECHINICAL_RECORD_CREATED);
  } catch (error) {
    console.log(error);
    return new HTTPResponse(error.statusCode, error.body);
  }
};

export { postTechRecords };

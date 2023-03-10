import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import { populatePartialVin } from "../utils/validations/ValidationUtils";
import { HTTPRESPONSE, VEHICLE_TYPE } from "../assets/Enums";
import { Vehicle } from "../../@Types/TechRecords";
import IMsUserDetails from "../../@Types/IUserDetails";

const isBodyArray = (body: unknown | unknown[]): body is unknown[] =>
  Array.isArray(body);
const postTechRecords = async (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);

  const eventBody: unknown[] = isBodyArray(event.body as unknown | unknown[])
    ? event.body
    : [event.body];
  const results = eventBody.map(async (body) => {
    return createSingleTechRecord(body as any, techRecordsService);
  });
  const res = await Promise.allSettled(results);
  return res[0];
};

type PostRecord = Partial<Vehicle & { msUserDetails: IMsUserDetails }>;

const createSingleTechRecord = async (
  eventBody: PostRecord | undefined,
  techRecordsService: TechRecordsService
) => {
  const vin = eventBody?.vin;
  const techRecord = eventBody?.techRecord;
  const msUserDetails = eventBody?.msUserDetails;
  const primaryVrm = eventBody?.primaryVrm;
  const secondaryVrms = eventBody?.secondaryVrms;
  const trailerId = eventBody?.trailerId;

  if (!vin || vin.length < 3 || vin.length > 21 || typeof vin !== "string") {
    return Promise.resolve(new HTTPResponse(400, "Invalid body field 'vin'"));
  }

  if (!techRecord || !techRecord.length) {
    return Promise.resolve(
      new HTTPResponse(400, "Body is not a valid TechRecord")
    );
  }

  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(
      new HTTPResponse(400, "Microsoft user details not provided")
    );
  }

  if (!eventBody) {
    return Promise.resolve(
      new HTTPResponse(400, "Body is not a valid TechRecord")
    );
  }

  const vehicleRecord: Vehicle = {
    vin,
    partialVin: populatePartialVin(vin),
    techRecord,
    systemNumber: "",
    primaryVrm,
    secondaryVrms,
  };

  // Only add the trailer id if we have it and vehicle is a trailer
  if (
    trailerId &&
    vehicleRecord.techRecord[0].vehicleType === VEHICLE_TYPE.TRL
  ) {
    vehicleRecord.trailerId = trailerId;
  }

  try {
    const data = await techRecordsService.insertTechRecord(
      vehicleRecord,
      msUserDetails
    );
    return new HTTPResponse(201, HTTPRESPONSE.TECHINICAL_RECORD_CREATED);
  } catch (error) {
    console.log(error);
    return new HTTPResponse(error.statusCode, error.body);
  }
};

export { postTechRecords };

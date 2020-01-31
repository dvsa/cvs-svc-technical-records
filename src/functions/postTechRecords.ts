import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import S3BucketService from "../services/S3BucketService";
import S3 = require("aws-sdk/clients/s3");
import ITechRecord from "../../@Types/ITechRecord";
import {populatePartialVin} from "../utils/PayloadValidation";

const postTechRecords = (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const s3BucketService = new S3BucketService(new S3());
  const techRecordsService = new TechRecordsService(techRecordsDAO, s3BucketService);
  const ONLY_DIGITS_AND_NUMBERS: RegExp = /^[A-Za-z0-9]+$/;

  const techRec: ITechRecord[] = event.body ? event.body.techRecord : null;
  const msUserDetails = event.body ? event.body.msUserDetails : null;
  const vin = event.body ? event.body.vin : null;
  const primaryVrm = event.body ? event.body.primaryVrm : null;
  const secondaryVrms = event.body ? event.body.secondaryVrms : null;

  if (!vin || !ONLY_DIGITS_AND_NUMBERS.test(vin) || vin.length < 3 || vin.length > 21 || typeof vin !== "string") {
    return Promise.resolve(new HTTPResponse(400, "Invalid body field 'vin'"));
  }

  if (!techRec || !techRec.length) {
    return Promise.resolve(new HTTPResponse(400, "Body is not a valid TechRecord"));
  }

  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(new HTTPResponse(400, "Microsoft user details not provided"));
  }

  const techRecord: ITechRecordWrapper = {
    vin,
    partialVin: populatePartialVin(vin),
    techRecord: techRec,
    primaryVrm,
    secondaryVrms
  };

  return techRecordsService.insertTechRecord(techRecord, msUserDetails)
    .then((data: any) => {
      return new HTTPResponse(201, "Technical Record created");
    })
    .catch((error: any) => {
      console.log(error);
      return new HTTPResponse(error.statusCode, error.body);
    });
};

export {postTechRecords};

import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import S3BucketService from "../services/S3BucketService";
import S3 = require("aws-sdk/clients/s3");

const downloadDocument = (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const s3BucketService = new S3BucketService(new S3());
  const techRecordsService = new TechRecordsService(techRecordsDAO, s3BucketService);
  const ONLY_DIGITS_AND_NUMBERS: RegExp = /^[A-Za-z0-9]+$/;

  const vin: string = event.pathParameters.vin;
  const filename: string = event.queryStringParameters ? event.queryStringParameters.filename : null;

  // searchTerm too long or too short
  if (!vin || !ONLY_DIGITS_AND_NUMBERS.test(vin) || vin.length < 9) {
    return Promise.resolve(new HTTPResponse(400, "Invalid path parameter 'vin'"));
  }

  if (!filename) {
    return Promise.resolve(new HTTPResponse(400, "Invalid query parameter 'filename'"));
  }

  return techRecordsService.downloadFile(filename)
    .then((document: string) => {
      return new HTTPResponse(200, document);
    })
    .catch((error: any) => {
      console.log(error);
      return new HTTPResponse(error.statusCode, error.body);
    });
};

export {downloadDocument};

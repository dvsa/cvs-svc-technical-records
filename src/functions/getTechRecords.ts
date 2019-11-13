import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import ITechRecord from "../../@Types/ITechRecord";
import {STATUS} from "../assets/Enums";
import {metaData} from "../utils/AdrValidation";
import S3BucketService from "../services/S3BucketService";
import S3 = require("aws-sdk/clients/s3");

const getTechRecords = (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const s3BucketService = new S3BucketService(new S3());
  const techRecordsService = new TechRecordsService(techRecordsDAO, s3BucketService);

  const status: string = (event.queryStringParameters) ? event.queryStringParameters.status : STATUS.PROVISIONAL_OVER_CURRENT;
  const metadata: string = (event.queryStringParameters) ? event.queryStringParameters.metadata : null;
  const searchIdentifier: string = (event.pathParameters) ? event.pathParameters.searchIdentifier : null;
  const filename: string = (event.queryStringParameters) ? event.queryStringParameters.filename : null;

  // searchTerm too long or too short
  if (!searchIdentifier || searchIdentifier.length < 3 || searchIdentifier.length > 21) {
    return Promise.resolve(new HTTPResponse(400, "The search identifier should be between 3 and 21 characters."));
  }

  if (filename) {
    console.log("FILENAME", filename);
    return techRecordsService.downloadFile(filename)
      .then((document: string) => {
        return new HTTPResponse(200, document);
      })
      .catch((error: any) => {
        console.log(error);
        return new HTTPResponse(error.statusCode, error.body);
      });
  } else {
    return techRecordsService.getTechRecordsList(searchIdentifier, status)
      .then((data: ITechRecord[]) => {
        if (metadata === "true") {
          Object.assign(data, {metadata: metaData});
        }
        return new HTTPResponse(200, data);
      })
      .catch((error: any) => {
        console.log(error);
        return new HTTPResponse(error.statusCode, error.body);
      });
  }
};

export {getTechRecords};

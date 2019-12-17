import { S3 } from "aws-sdk";
import ITechRecord from "../../@Types/ITechRecord";
import {ISearchCriteria} from "../../@Types/ISearchCriteria";
import {SEARCHCRITERIA, STATUS} from "../assets/Enums";
import TechRecordsDAO from "../models/TechRecordsDAO";
import HTTPResponse from "../models/HTTPResponse";
import TechRecordsService from "../services/TechRecordsService";
import S3BucketService from "../services/S3BucketService";
import {metaData} from "../utils/AdrValidation";

const getTechRecords = (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const s3BucketService = new S3BucketService(new S3());
  const techRecordsService = new TechRecordsService(techRecordsDAO, s3BucketService);

  const status: string = (event.queryStringParameters?.status) ? event.queryStringParameters.status : STATUS.PROVISIONAL_OVER_CURRENT;
  const searchCriteria: ISearchCriteria = (event.queryStringParameters?.searchCriteria) ? event.queryStringParameters.searchCriteria : SEARCHCRITERIA.ALL;
  const metadata: string = (event.queryStringParameters) ? event.queryStringParameters.metadata : null;
  const searchIdentifier: string = (event.pathParameters) ? event.pathParameters.searchIdentifier : null;

  // searchTerm too long or too short
  if (!searchIdentifier || searchIdentifier.length < 3 || searchIdentifier.length > 21) {
    return Promise.resolve(new HTTPResponse(400, "The search identifier should be between 3 and 21 characters."));
  }

  return techRecordsService.getTechRecordsList(searchIdentifier, status, searchCriteria)
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
};

export {getTechRecords};

import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import ITechRecord from "../../@Types/ITechRecord";

const getTechRecords = (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);

  const status = (event.queryStringParameters) ? event.queryStringParameters.status : "current";
  const searchIdentifier = (event.pathParameters) ? event.pathParameters.searchIdentifier : null;

  // searchTerm too long or too short
  if (!searchIdentifier || searchIdentifier.length < 3 || searchIdentifier.length > 21) {
    return Promise.resolve(new HTTPResponse(400, "The search identifier should be between 3 and 21 characters."));
  }

  return techRecordsService.getTechRecordsList(searchIdentifier, status)
    .then((data: ITechRecord[]) => {
      return new HTTPResponse(200, data);
    })
    .catch((error: any) => {
      console.log(error);
      return new HTTPResponse(error.statusCode, error.body);
    });
};

export {getTechRecords};

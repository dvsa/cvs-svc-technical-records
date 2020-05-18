import {ISearchCriteria} from "../../@Types/ISearchCriteria";
import {SEARCHCRITERIA, STATUS} from "../assets/Enums";
import TechRecordsDAO from "../models/TechRecordsDAO";
import HTTPResponse from "../models/HTTPResponse";
import TechRecordsService from "../services/TechRecordsService";
import {metaData} from "../utils/metadataEnums";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {isValidSearchCriteria} from "../utils/validations/PayloadValidation";

const getTechRecords = (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);

  const status: string = (event.queryStringParameters?.status) ? event.queryStringParameters.status : STATUS.PROVISIONAL_OVER_CURRENT;
  const searchCriteria: ISearchCriteria = (event.queryStringParameters?.searchCriteria) ? event.queryStringParameters.searchCriteria : SEARCHCRITERIA.ALL;
  const metadata: string = (event.queryStringParameters) ? event.queryStringParameters.metadata : null;
  const searchIdentifier: string | null = (event.pathParameters) ? decodeURIComponent(event.pathParameters.searchIdentifier) : null;

  // searchTerm too long or too short
  if (!searchIdentifier || searchIdentifier.length < 3 || searchIdentifier.length > 21) {
    return Promise.resolve(new HTTPResponse(400, "The search identifier should be between 3 and 21 characters."));
  }

  // TODO Not currently used. Probably should be. isValidSearchCriteria() just returns true to bypass at  the moment.
  if(!isValidSearchCriteria(searchCriteria)) {
    return Promise.resolve(new HTTPResponse(400, "The search criteria specified is not valid."));
  }

  return techRecordsService.getTechRecordsList(searchIdentifier, status, searchCriteria)
    .then((data: ITechRecordWrapper[]) => {

      if(!(data instanceof Array)) {
        return new HTTPResponse(200, Array.of(data));
      }

      if (metadata === "true") {
        data.forEach( ( record ) => {
          Object.assign(record, {metadata: metaData});
        });
      }

      return new HTTPResponse(200, data);
    })
    .catch((error: any) => {
      console.log(error);
      return new HTTPResponse(error.statusCode, error.body);
    });
};

export {getTechRecords};

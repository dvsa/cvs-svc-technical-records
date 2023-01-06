import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import IMsUserDetails from "../../@Types/IUserDetails";
import {formatErrorMessage} from "../utils/formatErrorMessage";


const addProvisionalTechRecord = async (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);

  const sysNum: string = event.pathParameters.systemNumber;
  const techRec = event.body?.techRecord;
  const msUserDetails: IMsUserDetails = event.body?.msUserDetails;

  if (!techRec || !techRec.length) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage("Body is not a valid TechRecord")));
  }

  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(new HTTPResponse(400, formatErrorMessage("Microsoft user details not provided")));
  }
  const techRecord = {
    vin: "",
    techRecord: techRec,
    systemNumber: sysNum
  };
  try {
    const addedProvisionalTechRecord = await techRecordsService.addProvisionalTechRecord(techRecord, msUserDetails);
    return new HTTPResponse(200, addedProvisionalTechRecord);
  } catch (error) {
    console.log(error);
    return new HTTPResponse(error.statusCode, error.body);
  }
};
export {addProvisionalTechRecord};

import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import ITechRecord from "../../@Types/ITechRecord";
import IMsUserDetails from "../../@Types/IUserDetails";

const addProvisionalTechRecord = (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);

  const sysNum: string = event.pathParameters.systemNumber;
  const techRec: ITechRecord[] = event.body ? event.body.techRecord : null;
  const msUserDetails: IMsUserDetails = event.body
    ? event.body.msUserDetails
    : null;

  if (!techRec || !techRec.length) {
    return Promise.resolve(
      new HTTPResponse(400, "Body is not a valid TechRecord")
    );
  }

  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    return Promise.resolve(
      new HTTPResponse(400, "Microsoft user details not provided")
    );
  }
  const techRecord: ITechRecordWrapper = {
    vin: "",
    techRecord: techRec,
    systemNumber: sysNum
  };
  return techRecordsService
    .addProvisionalTechRecord(techRecord, msUserDetails)
    .then((addedProvisionalTechRecord: any) => {
      return new HTTPResponse(200, addedProvisionalTechRecord);
    })
    .catch((error: any) => {
      console.log(error);
      return new HTTPResponse(error.statusCode, error.body);
    });
};
export { addProvisionalTechRecord };

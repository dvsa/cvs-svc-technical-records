import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import { ERRORS } from "../assets/Enums";

export async function archiveTechRecordStatus(event: any) {
    const techRecordsService = new TechRecordsService(new TechRecordsDAO());

    const systemNumber: string = event.pathParameters!.systemNumber;
    const techRec = event.body && event.body.techRecord? event.body.techRecord : null;
    if (!techRec) {
      return Promise.resolve(new HTTPResponse(400, ERRORS.MISSING_PAYLOAD));
    }
    const msUserDetails = event.body && event.body.msUserDetails ? event.body.msUserDetails : null;
    if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
        return Promise.resolve(new HTTPResponse(400, ERRORS.MISSING_USER));
      }
    const techRecord: ITechRecordWrapper = {
        vin: "",
        systemNumber,
        techRecord: techRec
      };
    try {
        const updatedTechRec = await techRecordsService.archiveTechRecordStatus(systemNumber, techRecord, msUserDetails );
        return new HTTPResponse(200, updatedTechRec);
    } catch (error) {
        return new HTTPResponse(error.statusCode, error.body);
    }
}

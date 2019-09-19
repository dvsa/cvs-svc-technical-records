import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";

const updateTechRecords = (event: any) => {
    const techRecordsDAO = new TechRecordsDAO();
    const techRecordsService = new TechRecordsService(techRecordsDAO);

    const payload: ITechRecordWrapper = event.body;

    if (!payload || !(payload.techRecord && payload.techRecord.length)) {
        return Promise.resolve(new HTTPResponse(404, "Body is not a valid TechRecord"));
    }

    // TODO: validate payload for every type of vehicle(psv, hgv, trl) - will be done in a future ticket

    return techRecordsService.updateTechRecord(payload)
        .then((updatedTechRec: any) => {
            return new HTTPResponse(200, updatedTechRec);
        })
        .catch((error: any) => {
            console.log(error);
            return new HTTPResponse(error.statusCode, error.body);
        });

};

export {updateTechRecords};

import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";

const postTechRecords = (event: any) => {
    const techRecordsDAO = new TechRecordsDAO();
    const techRecordsService = new TechRecordsService(techRecordsDAO);

    const payload: ITechRecordWrapper = event.body;

    if (!payload || !(payload.techRecord && payload.techRecord.length)) {
        return Promise.resolve(new HTTPResponse(400, "Body is not a valid TechRecord"));
    }

    // TODO: validate payload for every type of vehicle(psv, hgv, trl) - will be done in a future ticket

    payload.partialVin = payload.vin.substr(payload.vin.length - 6);
    return techRecordsService.insertTechRecord(payload)
        .then((data: any) => {
            return new HTTPResponse(201, "Technical Record created");
        })
        .catch((error: any) => {
            console.log(error);
            return new HTTPResponse(error.statusCode, error.body);
        });
};

export {postTechRecords};

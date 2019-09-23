import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";

const updateTechRecords = (event: any) => {
    const techRecordsDAO = new TechRecordsDAO();
    const techRecordsService = new TechRecordsService(techRecordsDAO);
    const ONLY_DIGITS_AND_NUMBERS: RegExp = /^[A-Za-z0-9]+$/;

    let payload: ITechRecordWrapper = event.body;
    const vin = event.pathParameters.vin;

    if (!vin || !ONLY_DIGITS_AND_NUMBERS.test(vin) || vin.length < 9) {
        return Promise.resolve(new HTTPResponse(400, "Invalid path parameter 'vin'"));
    }

    if (!payload || !(payload.techRecord && payload.techRecord.length)) {
        return Promise.resolve(new HTTPResponse(400, "Body is not a valid TechRecord"));
    }

    // TODO: validate payload for every type of vehicle(psv, hgv, trl) - will be done in a future ticket

    payload = Object.assign(payload, {vin});
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

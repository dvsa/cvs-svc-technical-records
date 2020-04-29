import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import {STATUS, HTTPRESPONSE} from "../assets/Enums";

export async function updateTechRecordStatus(event: any) {
    const techRecordsService = new TechRecordsService(new TechRecordsDAO());

    const systemNumber: string = event.pathParameters!.systemNumber;
    const testStatus: string = event.queryStringParameters!.testStatus;
    const testResult: string = event.queryStringParameters!.testResult;
    const testTypeId: string = event.queryStringParameters!.testTypeId;
    const newStatus = event.queryStringParameters ? STATUS[event.queryStringParameters.newStatus as keyof typeof STATUS] : undefined;
    const createdById: string = event.queryStringParameters!.createdById;
    const createdByName: string = event.queryStringParameters!.createdByName;

    if (!TechRecordsService.isStatusUpdateRequired(testStatus, testResult, testTypeId)) {
        return new HTTPResponse(200, HTTPRESPONSE.NO_STATUS_UPDATE_REQUIRED);
    }
    try {
        const updatedTechRec = await techRecordsService.updateTechRecordStatusCode(systemNumber, newStatus, createdById, createdByName);
        return new HTTPResponse(200, updatedTechRec);
    } catch (error) {
        return new HTTPResponse(error.statusCode, error.body);
    }
}

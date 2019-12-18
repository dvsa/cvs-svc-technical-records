import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import {STATUS, HTTPRESPONSE} from "../assets/Enums";
import S3BucketService from "../services/S3BucketService";
import { S3 } from "aws-sdk";

export async function updateTechRecordStatus(event: any) {
    const s3BucketService = new S3BucketService(new S3());
    const techRecordsService = new TechRecordsService(new TechRecordsDAO(), s3BucketService);

    const vin: string = event.pathParameters!.vin;
    const testStatus: string = event.queryStringParameters!.testStatus;
    const testResult: string = event.queryStringParameters!.testResult;
    const testTypeId: string = event.queryStringParameters!.testTypeId;
    const newStatus = event.queryStringParameters ? STATUS[event.queryStringParameters.newStatus as keyof typeof STATUS] : undefined;

    if (!TechRecordsService.isStatusUpdateRequired(testStatus, testResult, testTypeId)) {
        return new HTTPResponse(200, HTTPRESPONSE.NO_STATUS_UPDATE_REQUIRED);
    }
    try {
        const updatedTechRec = await techRecordsService.updateTechRecordStatusCode(vin, newStatus );
        return new HTTPResponse(200, updatedTechRec);
    } catch (error) {
        return new HTTPResponse(error.statusCode, error.body);
    }
}

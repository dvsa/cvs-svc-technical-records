import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import {APIGatewayEvent} from "aws-lambda";
import {STATUS} from "../assets/Enums";
import S3BucketService from "../services/S3BucketService";
import { S3 } from "aws-sdk";

export async function updateTechRecordStatus(event: APIGatewayEvent) {
    const s3BucketService = new S3BucketService(new S3());
    const techRecordsService = new TechRecordsService(new TechRecordsDAO(), s3BucketService);
    const ONLY_DIGITS_AND_NUMBERS: RegExp = /^[A-Za-z0-9]+$/;

    const vin = event.pathParameters!.vin;
    console.log(STATUS[event.queryStringParameters!.newStatus as keyof typeof STATUS]);
    const newStatus = event.queryStringParameters ? STATUS[event.queryStringParameters.newStatus as keyof typeof STATUS] : undefined;

    if (!vin || !ONLY_DIGITS_AND_NUMBERS.test(vin) || vin.length < 9) {
        return Promise.resolve(new HTTPResponse(400, "Invalid path parameter 'vin'"));
    }

    try {
        const updatedTechRec = await techRecordsService.updateTechRecordStatus(vin, newStatus );
        return new HTTPResponse(200, updatedTechRec);
    } catch (error) {
        return new HTTPResponse(error.statusCode, error.body);
    }
}


import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import HTTPResponse from "../models/HTTPResponse";
import { EU_VEHICLE_CATEGORY, HTTPRESPONSE } from "../assets/Enums";

export async function updateEuVehicleCategory(event: any) {
    const techRecordsService = new TechRecordsService(new TechRecordsDAO());

    const systemNumber: string = event.pathParameters.systemNumber;
    const createdById: string = event.queryStringParameters ? event.queryStringParameters.createdById : undefined;
    const createdByName: string = event.queryStringParameters ? event.queryStringParameters.createdByName : undefined;
    // to handle when l1e-a is pushed as a value.
    const euVehicleCategoryString: string = event.queryStringParameters.euVehicleCategory === "l1e-a" ? "l1ea" : event.queryStringParameters.euVehicleCategory;
    const euVehicleCategory = EU_VEHICLE_CATEGORY[euVehicleCategoryString.toUpperCase() as keyof typeof EU_VEHICLE_CATEGORY];
    try {
        if(euVehicleCategory) {
            return await techRecordsService.updateEuVehicleCategory(systemNumber, euVehicleCategory, createdById, createdByName);
        } else {
            return new HTTPResponse(400, HTTPRESPONSE.INVALID_EU_VEHICLE_CATEGORY);
        }
    } catch (error) {
        return new HTTPResponse(error.statusCode, error.body);
    }
}

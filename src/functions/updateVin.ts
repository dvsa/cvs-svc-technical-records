import { TechRecord } from "../../@Types/TechRecords";
import { HTTPRESPONSE, SEARCHCRITERIA, STATUS } from "../assets";
import { VehicleProcessor } from "../domain/Processors";
import { ErrorHandler, TechRecordsListHandler } from "../handlers";
import HTTPError from "../models/HTTPError";
import HTTPResponse from "../models/HTTPResponse";
import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";

const updateVin = async (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);
  const techRecordListHandler = new TechRecordsListHandler(techRecordsDAO);

  try {
    validateParameters(event);

    const {
      pathParameters: { systemNumber },
      body: {
        newVin,
        msUserDetails: { msUser, msOid },
      },
    } = event;

    const vehicles = await techRecordListHandler.getTechRecordList(
      systemNumber,
      STATUS.ALL,
      SEARCHCRITERIA.SYSTEM_NUMBER
    );
    const activeVehicle = VehicleProcessor.getTechRecordToUpdate(
      vehicles,
      (techRecord: TechRecord) => STATUS.ARCHIVED !== techRecord.statusCode
    );

    validateVins(activeVehicle.vin, newVin);

    // In case we update to an existing vin, we have to extract the archived records on that vin to save them back in
    const previousTechRecordsOnNewVin =
      vehicles.find((vehicle) => vehicle.vin === newVin)?.techRecord ?? [];

    const { oldVehicle, newVehicle } = techRecordsService.updateVin(
      activeVehicle,
      newVin,
      msUser,
      msOid,
      previousTechRecordsOnNewVin
    );

    await techRecordsDAO.updateVin(newVehicle, oldVehicle);

    return new HTTPResponse(200, HTTPRESPONSE.VIN_UPDATED);
  } catch (error) {
    console.log(error);
    if (error instanceof HTTPError) {
      return new HTTPResponse(error.statusCode, error.body);
    } else {
      return new HTTPResponse(500, HTTPRESPONSE.INTERNAL_SERVER_ERROR);
    }
  }
};

function validateParameters(event: any) {
  if (!event.pathParameters?.systemNumber) {
    throw ErrorHandler.Error(400, "Invalid path parameter 'systemNumber'");
  }

  const msUserDetails = event.body?.msUserDetails;
  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    throw ErrorHandler.Error(400, "Microsoft user details not provided");
  }
}

function validateVins(oldVin: string, newVin: string) {
  if (
    !newVin ||
    newVin.length < 3 ||
    newVin.length > 21 ||
    typeof newVin !== "string"
  ) {
    throw ErrorHandler.Error(400, "New vin is invalid");
  }
  if (newVin === oldVin) {
    throw ErrorHandler.Error(400, "New vin must be different to current");
  }
}

export { updateVin, validateVins, validateParameters };

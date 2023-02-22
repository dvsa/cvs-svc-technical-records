import { TechRecord } from "../../@Types/TechRecords";
import { HTTPRESPONSE, SEARCHCRITERIA, STATUS } from "../assets";
import { VehicleProcessor } from "../domain/Processors";
import { AuditDetailsHandler, TechRecordsListHandler } from "../handlers";
import HTTPResponse from "../models/HTTPResponse";
import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import { formatErrorMessage } from "../utils/formatErrorMessage";

const updateVin = async (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);
  const techRecordListHandler = new TechRecordsListHandler(techRecordsDAO);
  const auditDetailsHandler = new AuditDetailsHandler();

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

    const now = new Date().toISOString();
    activeVehicle.techRecord.forEach((t) => {
      if (STATUS.ARCHIVED !== t.statusCode) {
        auditDetailsHandler.setLastUpdatedAuditDetails(t, msUser, msOid, now);
      }
    });

    const { oldVehicle, newVehicle } = techRecordsService.updateVin(
      activeVehicle,
      newVin
    );

    await techRecordsDAO.updateVin(newVehicle, oldVehicle);

    return new HTTPResponse(200, HTTPRESPONSE.VIN_UPDATED);
  } catch (error) {
    if (error instanceof HTTPResponse) {
      return error;
    } else {
      return new HTTPResponse(500, HTTPRESPONSE.INTERNAL_SERVER_ERROR);
    }
  }
};

function validateParameters(event: any) {
  if (!event.pathParameters?.systemNumber) {
    throw badRequest("Invalid path parameter 'systemNumber'");
  }

  const msUserDetails = event.body?.msUserDetails;
  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    throw badRequest("Microsoft user details not provided");
  }
}

function validateVins(oldVin: string, newVin: string) {
  if (
    !newVin ||
    newVin.length < 3 ||
    newVin.length > 21 ||
    typeof newVin !== "string"
  ) {
    throw badRequest("New vin is invalid");
  }
  if (newVin === oldVin) {
    throw badRequest("New vin must be different to current");
  }
}

function badRequest(error: string) {
  return new HTTPResponse(400, formatErrorMessage(error));
}

export { updateVin, validateVins };

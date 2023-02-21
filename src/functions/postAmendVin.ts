import { TechRecord } from "../../@Types/TechRecords";
import { HTTPRESPONSE, SEARCHCRITERIA, STATUS } from "../assets";
import { VehicleProcessor } from "../domain/Processors";
import { AuditDetailsHandler, TechRecordsListHandler } from "../handlers";
import HTTPResponse from "../models/HTTPResponse";
import TechRecordsDAO from "../models/TechRecordsDAO";
import TechRecordsService from "../services/TechRecordsService";
import { formatErrorMessage } from "../utils/formatErrorMessage";

const postAmendVin = async (event: any) => {
  const techRecordsDAO = new TechRecordsDAO();
  const techRecordsService = new TechRecordsService(techRecordsDAO);
  const techRecordListHandler = new TechRecordsListHandler(techRecordsDAO);
  const auditDetailsHandler = new AuditDetailsHandler();

  try {
    validateParameters(event);

    const {
      pathParameters: { systemNumber },
      body: { newVin, msUserDetails: {msUser, msOid} },
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

    const now = new Date().toISOString();
    activeVehicle.techRecord.forEach((t) => {
      if(STATUS.ARCHIVED !== t.statusCode) {
        auditDetailsHandler.setLastUpdatedAuditDetails(t, msUser, msOid, now);
      }
    });

    const [newVehicle, oldVehicle] = techRecordsService.updateVin(
      activeVehicle,
      newVin
    );

    await techRecordsDAO.updateVin(newVehicle, oldVehicle);

    return new HTTPResponse(200, HTTPRESPONSE.VIN_UPDATED);
  } catch (error) {
    console.log(error);
    if (error instanceof HTTPResponse) {
      return new HTTPResponse(error.statusCode, error.body);
    } else {
      return new HTTPResponse(500, HTTPRESPONSE.INTERNAL_SERVER_ERROR);
    }
  }
};

function validateParameters(event: any) {
  const {
    pathParameters: { systemNumber },
    body: { msUserDetails, newVin },
  } = event;

  if (!systemNumber) {
    throw badRequest("Invalid path parameter 'systemNumber'");
  }

  if (
    !newVin ||
    newVin.length < 3 ||
    newVin.length > 21 ||
    typeof newVin !== "string"
  ) {
    throw badRequest("Invalid new vehicle identification number 'vin'");
  }

  if (!msUserDetails || !msUserDetails.msUser || !msUserDetails.msOid) {
    throw badRequest("Microsoft user details not provided");
  }
}

function badRequest(error: string) {
  return new HTTPResponse(400, formatErrorMessage(error));
}

export { postAmendVin };

import HTTPError from "../models/HTTPError";
import TechRecordsDAO from "../models/TechRecordsDAO";
import ITechRecord from "../../@Types/ITechRecord";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {HTTPRESPONSE, STATUS} from "../assets/Enums";
import HTTPResponse from "../models/HTTPResponse";
import {validateAdr} from "../utils/AdrValidation";

/**
 * Fetches the entire list of Technical Records from the database.
 * @returns Promise
 */

class TechRecordsService {
  private techRecordsDAO: TechRecordsDAO;

  constructor(techRecordsDAO: TechRecordsDAO) {
    this.techRecordsDAO = techRecordsDAO;
  }

  public getTechRecordsList(searchTerm: string, status: string) {
    return this.techRecordsDAO.getBySearchTerm(searchTerm)
      .then((data: any) => {
        if (data.Count === 0) {
          throw new HTTPError(404, HTTPRESPONSE.RESOURCE_NOT_FOUND);
        }

        if (data.Count > 1) {
          throw new HTTPError(422, HTTPRESPONSE.MORE_THAN_ONE_MATCH);
        }

        // Formatting the object for lambda function
        let techRecordItem = data.Items[0];
        if (status !== STATUS.ALL) {
          techRecordItem = this.filterTechRecordsByStatus(techRecordItem, status);
        }
        techRecordItem = this.formatTechRecordItemForResponse(techRecordItem);

        return techRecordItem;
      })
      .catch((error: any) => {
        if (!(error instanceof HTTPError)) {
          console.error(error);
          error.statusCode = 500;
          error.body = HTTPRESPONSE.INTERNAL_SERVER_ERROR;
        }
        throw new HTTPError(error.statusCode, error.body);
      });
  }

  private filterTechRecordsByStatus(techRecordItem: ITechRecordWrapper, status: string) {
    const originalTechRecordItem = JSON.parse(JSON.stringify(techRecordItem));
    let provisionalOverCurrent = false;
    if (status === STATUS.PROVISIONAL_OVER_CURRENT) {
      provisionalOverCurrent = true;
      status = STATUS.PROVISIONAL;
    }

    techRecordItem.techRecord = techRecordItem.techRecord
      .filter((techRecord: any) => {
        return techRecord.statusCode === status;
      });

    const {length} = originalTechRecordItem.techRecord;
    const {statusCode} = originalTechRecordItem.techRecord[0];

    if (provisionalOverCurrent && length === 1 && techRecordItem.techRecord.length > 0 && (statusCode === STATUS.CURRENT || statusCode === STATUS.PROVISIONAL)) {
      return techRecordItem;
    }

    if (provisionalOverCurrent && ((length === techRecordItem.techRecord.length) || (0 === techRecordItem.techRecord.length))) {
      techRecordItem = this.filterTechRecordsByStatus(originalTechRecordItem, STATUS.CURRENT);
    }

    if (techRecordItem.techRecord.length <= 0) {
      throw new HTTPError(404, HTTPRESPONSE.RESOURCE_NOT_FOUND);
    }

    return techRecordItem;
  }

  public formatTechRecordItemForResponse(techRecordItem: ITechRecordWrapper) {
    // Adding primary and secondary VRMs in the same array
    const vrms = [{vrm: techRecordItem.primaryVrm, isPrimary: true}];
    Object.assign(techRecordItem, {
      vrms
    });
    // Cleaning up unneeded properties
    delete techRecordItem.primaryVrm; // No longer needed
    delete techRecordItem.secondaryVrms; // No longer needed
    delete techRecordItem.partialVin; // No longer needed

    techRecordItem.techRecord.forEach((techRecord) => {
      if (techRecord.euroStandard !== undefined && techRecord.euroStandard !== null) {
        techRecord.euroStandard = techRecord.euroStandard.toString();
      }
    });

    return techRecordItem;
  }

  public insertTechRecord(techRecord: ITechRecordWrapper) {
    return this.techRecordsDAO.createSingle(techRecord)
      .then((data: any) => {
        return data;
      })
      .catch((error: any) => {
        throw new HTTPError(error.statusCode, error.message);
      });
  }

  public updateTechRecord(techRecord: ITechRecordWrapper) {
    // let isBatteryOrTank = false, isBattery = false;
    // return this.getTechRecordsList(techRecord.vin, STATUS.CURRENT)
    //   .then((data: ITechRecordWrapper) => {
    //     const currentTechRecord = data.techRecord[0];
    //     if(techRecord.techRecord[0].adrDetails) {
    //       const vehicleDetailsType = techRecord.techRecord[0].adrDetails.vehicleDetails.type.toLowerCase();
    //       if (vehicleDetailsType.indexOf("battery") !== -1) {
    //         isBattery = true;
    //       }
    //       if ((vehicleDetailsType.indexOf("battery") !== -1) || (vehicleDetailsType.indexOf("tank") !== -1)) {
    //         isBatteryOrTank = true;
    //       }
    //     }
    //     const isAdrValid = validateAdr(techRecord.techRecord[0].adrDetails, isBatteryOrTank, isBattery);
    //     return data;
    //   })
    //   .catch((error: any) => {
    //     console.log("EROARE", error);
    //     return new HTTPResponse(error.statusCode, error.body);
    //   });
    return this.techRecordsDAO.updateSingle(techRecord)
      .then((data: any) => {
        const response = data.Attributes;
        const vrms = [{vrm: response.primaryVrm, isPrimary: true}];
        Object.assign(response, {
          vrms
        });
        // Cleaning up unneeded properties
        delete response.primaryVrm; // No longer needed
        delete response.secondaryVrms; // No longer needed
        delete response.partialVin; // No longer needed
        return response;
      })
      .catch((error: any) => {
        throw new HTTPError(error.statusCode, error.message);
      });
  }

  public insertTechRecordsList(techRecordItems: ITechRecordWrapper[]) {
    return this.techRecordsDAO.createMultiple(techRecordItems)
      .then((data) => {
        if (data.UnprocessedItems) {
          return data.UnprocessedItems;
        }
      })
      .catch((error: any) => {
        console.error(error);
        throw new HTTPError(500, HTTPRESPONSE.INTERNAL_SERVER_ERROR);
      });
  }

  public deleteTechRecordsList(techRecordItemKeys: string[][]) {
    return this.techRecordsDAO.deleteMultiple(techRecordItemKeys)
      .then((data) => {
        if (data.UnprocessedItems) {
          return data.UnprocessedItems;
        }
      })
      .catch((error: any) => {
        console.error(error);
        throw new HTTPError(500, HTTPRESPONSE.INTERNAL_SERVER_ERROR);
      });
  }
}

export default TechRecordsService;

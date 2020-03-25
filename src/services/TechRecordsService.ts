import HTTPError from "../models/HTTPError";
import TechRecordsDAO from "../models/TechRecordsDAO";
import ITechRecord from "../../@Types/ITechRecord";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {
  ERRORS,
  HTTPRESPONSE,
  SEARCHCRITERIA,
  STATUS,
  UPDATE_TYPE,
  VEHICLE_TYPE,
  EU_VEHICLE_CATEGORY
} from "../assets/Enums";
import * as _ from "lodash";
import {
  validatePayload,
  validatePrimaryVrm,
  validateSecondaryVrms
} from "../utils/PayloadValidation";
import {ISearchCriteria} from "../../@Types/ISearchCriteria";
import {populateFields} from "../utils/ValidationUtils";
import HTTPResponse from "../models/HTTPResponse";
import {ValidationError, ValidationResult} from "@hapi/joi";
import {formatErrorMessage} from "../utils/formatErrorMessage";

/**
 * Fetches the entire list of Technical Records from the database.
 * @returns Promise
 */

class TechRecordsService {
  private techRecordsDAO: TechRecordsDAO;

  constructor(techRecordsDAO: TechRecordsDAO) {
    this.techRecordsDAO = techRecordsDAO;
  }

  public getTechRecordsList(searchTerm: string, status: string, searchCriteria: ISearchCriteria = SEARCHCRITERIA.ALL): Promise<ITechRecordWrapper[]> {
    return this.techRecordsDAO.getBySearchTerm(searchTerm, searchCriteria)
      .then((data: any) => {
        if (data.Count === 0) {
          throw new HTTPError(404, HTTPRESPONSE.RESOURCE_NOT_FOUND);
        }

        // Formatting the object for lambda function
        let techRecordItems: ITechRecordWrapper[] = data.Items;
        if (status !== STATUS.ALL) {
          techRecordItems = this.filterTechRecordsByStatus(techRecordItems, status);
        }
        techRecordItems = this.formatTechRecordItemsForResponse(techRecordItems);

        return techRecordItems;
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

  private filterTechRecordsByStatus(techRecordItems: ITechRecordWrapper[], status: string): ITechRecordWrapper[] {
    const recordsToReturn = [];
    for (let techRecordItem of techRecordItems) {
      techRecordItem = this.filterTechRecordsForIndividualVehicleByStatus(techRecordItem, status);
      if (techRecordItem.techRecord.length > 0) {
        recordsToReturn.push(techRecordItem);
      }
    }
    return recordsToReturn;
  }

  private filterTechRecordsForIndividualVehicleByStatus(techRecordItem: ITechRecordWrapper, status: string): ITechRecordWrapper {
    const originalTechRecordItem = _.cloneDeep(techRecordItem);
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
      techRecordItem = this.filterTechRecordsForIndividualVehicleByStatus(originalTechRecordItem, STATUS.CURRENT);
    }

    if (techRecordItem.techRecord.length <= 0) {
      throw new HTTPError(404, HTTPRESPONSE.RESOURCE_NOT_FOUND);
    }

    return techRecordItem;
  }

  public formatTechRecordItemsForResponse(techRecordItems: ITechRecordWrapper[]) {
    const recordsToReturn = [];
    for (let techRecordItem of techRecordItems) {
      techRecordItem = this.formatTechRecordItemForResponse(techRecordItem);
      recordsToReturn.push(techRecordItem);
    }
    return recordsToReturn;
  }

  public formatTechRecordItemForResponse(techRecordItem: ITechRecordWrapper) {
    // Adding primary and secondary VRMs in the same array
    const vrms = [];
    if (techRecordItem.primaryVrm) {
      vrms.push({vrm: techRecordItem.primaryVrm, isPrimary: true});
    }
    if (techRecordItem.secondaryVrms) {
      for (const secondaryVrm of techRecordItem.secondaryVrms) {
        vrms.push({vrm: secondaryVrm, isPrimary: false});
      }
    }
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

  public mapValidationErrors(validationError: ValidationError) {
    return {
      errors: validationError.details.map((detail: { message: string; }) => {
        return detail.message;
      })
    };
  }

  public checkValidationErrors(validation: ValidationResult) {
    if (validation.error) {
      throw new HTTPError(400, this.mapValidationErrors(validation.error));
    }
  }

  public async insertTechRecord(techRecord: ITechRecordWrapper, msUserDetails: any) {
    const isPayloadValid = validatePayload(techRecord.techRecord[0]);
    this.checkValidationErrors(isPayloadValid);
    techRecord.systemNumber = await this.generateSystemNumber();
    if (!this.validateVrms(techRecord)) {
      return Promise.reject({statusCode: 400, body: "Primary or secondaryVrms are not valid"});
    }
    if (techRecord.techRecord[0].vehicleType === VEHICLE_TYPE.TRL) {
      techRecord.trailerId = await this.setTrailerId();
    }
    techRecord.techRecord[0] = isPayloadValid.value;
    populateFields(techRecord.techRecord[0]);
    this.setAuditDetailsAndStatusCodeForNewRecord(techRecord.techRecord[0], msUserDetails);
    return this.techRecordsDAO.createSingle(techRecord)
      .then((data: any) => {
        return data;
      })
      .catch((error: any) => {
        throw new HTTPError(error.statusCode, error.message);
      });
  }

  public async generateSystemNumber() {
    try {
      const systemNumberObj = await this.techRecordsDAO.getSystemNumber();
      if (systemNumberObj.error) {
        return Promise.reject({statusCode: 500, body: systemNumberObj.error});
      }
      if (!systemNumberObj.systemNumber) {
        return Promise.reject({statusCode: 500, body: ERRORS.SYSTEM_NUMBER_GENERATION_FAILED});
      }
      return systemNumberObj.systemNumber;
    } catch (error) {
      return Promise.reject({statusCode: 500, body: error});
    }
  }

  public async setTrailerId() {
    try {
      const trailerIdObj = await this.techRecordsDAO.getTrailerId();
      if (trailerIdObj.error) {
        return Promise.reject({statusCode: 500, body: trailerIdObj.error});
      }
      if (!trailerIdObj.trailerId) {
        return Promise.reject({statusCode: 500, body: ERRORS.TRAILER_ID_GENERATION_FAILED});
      }
      return trailerIdObj.trailerId;
    } catch (error) {
      return Promise.reject({statusCode: 500, body: error});
    }
  }

  private validateVrms(techRecord: ITechRecordWrapper) {
    let areVrmsValid = true;
    const vehicleType = techRecord.techRecord[0].vehicleType;
    if ((vehicleType === VEHICLE_TYPE.HGV || vehicleType === VEHICLE_TYPE.PSV) && !techRecord.primaryVrm) {
      areVrmsValid = false;
    } else {
      const isValid = validatePrimaryVrm.validate(techRecord.primaryVrm);
      if (isValid.error) {
        areVrmsValid = false;
      }
    }
    if (techRecord.secondaryVrms) {
      const isValid = validateSecondaryVrms.validate(techRecord.secondaryVrms);
      if (isValid.error) {
        areVrmsValid = false;
      }
    }
    return areVrmsValid;
  }

  private setAuditDetailsAndStatusCodeForNewRecord(techRecord: ITechRecord, msUserDetails: any) {
    techRecord.createdAt = new Date().toISOString();
    techRecord.createdByName = msUserDetails.msUser;
    techRecord.createdById = msUserDetails.msOid;
    techRecord.statusCode = STATUS.PROVISIONAL;
  }

  public updateTechRecord(techRecord: ITechRecordWrapper, msUserDetails: any) {
    return this.createAndArchiveTechRecord(techRecord, msUserDetails)
      .then((data: ITechRecordWrapper) => {
        return this.techRecordsDAO.updateSingle(data)
          .then((updatedData: any) => {
            return this.formatTechRecordItemForResponse(updatedData.Attributes);
          })
          .catch((error: any) => {
            throw new HTTPError(error.statusCode, formatErrorMessage(error.message));
          });
      })
      .catch((error: any) => {
        throw new HTTPError(error.statusCode, error.body);
      });
  }

  private async createAndArchiveTechRecord(techRecord: ITechRecordWrapper, msUserDetails: any) {
    const {statusCode} = techRecord.techRecord[0];
    delete techRecord.techRecord[0].statusCode;
    if (statusCode === STATUS.ARCHIVED) {
      return Promise.reject({statusCode: 400, body: formatErrorMessage(ERRORS.CANNOT_UPDATE_ARCHIVED_RECORD)});
    }
    const isPayloadValid = validatePayload(techRecord.techRecord[0], false);
    this.checkValidationErrors(isPayloadValid);
    techRecord.techRecord[0] = isPayloadValid.value;
    return this.getTechRecordsList(techRecord.systemNumber, STATUS.ALL, SEARCHCRITERIA.SYSTEM_NUMBER)
      .then((data: ITechRecordWrapper[]) => {
        if (data.length !== 1) {
          // systemNumber search should return a unique record
          throw new HTTPError(500, ERRORS.NO_UNIQUE_RECORD);
        }
        const uniqueRecord = data[0];
        this.updateAttributesOutsideTechRecordsArray(uniqueRecord, techRecord);
        const oldTechRec = this.getTechRecordToArchive(uniqueRecord, statusCode);
        const newRecord: ITechRecord = _.cloneDeep(oldTechRec);
        oldTechRec.statusCode = STATUS.ARCHIVED;
        _.mergeWith(newRecord, techRecord.techRecord[0], this.arrayCustomizer);
        this.setAuditDetails(newRecord, oldTechRec, msUserDetails);
        populateFields(newRecord);
        uniqueRecord.techRecord.push(newRecord);
        return uniqueRecord;
      })
      .catch((error: any) => {
        throw new HTTPError(error.statusCode, error.body);
      });
  }

  public updateAttributesOutsideTechRecordsArray(uniqueRecord: any, techRecord: ITechRecordWrapper) {
    let primaryVrm;
    for (const vrm of uniqueRecord.vrms) {
      if (vrm.isPrimary) {
        primaryVrm = vrm.vrm;
        break;
      }
    }
    if (techRecord.primaryVrm && primaryVrm !== techRecord.primaryVrm) {
      // do a get using primaryVrm -> if found -> return 400, else update primaryVrm
    }
    if (techRecord.trailerId && techRecord.techRecord[0].vehicleType === VEHICLE_TYPE.TRL && uniqueRecord.trailerId !== techRecord.trailerId) {
      // do a get using trailerId -> if found -> return 400, else update trailerId
    }
    if (techRecord.secondaryVrms) {
      uniqueRecord.secondaryVrms = techRecord.secondaryVrms;
    }
  }

  private arrayCustomizer(objValue: any, srcValue: any) {
    if (_.isArray(objValue) && _.isArray(srcValue)) {
      return srcValue;
    }
  }

  public getTechRecordToArchive(techRecord: ITechRecordWrapper, statusCode: string) {
    const recordsToArchive = techRecord.techRecord.filter((record) => {
      return record.statusCode === statusCode;
    });
    if (recordsToArchive.length > 1) {
      throw new HTTPError(500, `Vehicle has more than one tech-record with status ${statusCode}`);
    } else if (recordsToArchive.length === 0) {
      throw new HTTPError(404, `Vehicle has no tech-records with status ${statusCode}`);
    } else {
      return recordsToArchive[0];
    }
  }

  private setAuditDetails(newTechRecord: ITechRecord, oldTechRecord: ITechRecord, msUserDetails: any) {
    const date = new Date().toISOString();
    newTechRecord.createdAt = date;
    newTechRecord.createdByName = msUserDetails.msUser;
    newTechRecord.createdById = msUserDetails.msOid;
    delete newTechRecord.lastUpdatedAt;
    delete newTechRecord.lastUpdatedById;
    delete newTechRecord.lastUpdatedByName;

    oldTechRecord.lastUpdatedAt = date;
    oldTechRecord.lastUpdatedByName = msUserDetails.msUser;
    oldTechRecord.lastUpdatedById = msUserDetails.msOid;

    let updateType = UPDATE_TYPE.TECH_RECORD_UPDATE;
    if (newTechRecord.adrDetails || oldTechRecord.adrDetails) {
      updateType = _.isEqual(newTechRecord.adrDetails, oldTechRecord.adrDetails) ? UPDATE_TYPE.TECH_RECORD_UPDATE : UPDATE_TYPE.ADR;
    }
    oldTechRecord.updateType = updateType;
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

  public async updateTechRecordStatusCode(systemNumber: string, newStatus: STATUS = STATUS.CURRENT) {
    const techRecordWrapper: ITechRecordWrapper[] = await this.getTechRecordsList(systemNumber, STATUS.ALL, SEARCHCRITERIA.SYSTEM_NUMBER);
    if (techRecordWrapper.length !== 1) {
      // systemNumber search should return a single record
      throw new HTTPError(500, ERRORS.NO_UNIQUE_RECORD);
    }
    const uniqueRecord = techRecordWrapper[0];
    const provisionalTechRecords = uniqueRecord.techRecord.filter((techRecord) => techRecord.statusCode === STATUS.PROVISIONAL);
    if (provisionalTechRecords.length === 1) {
      provisionalTechRecords[0].statusCode = STATUS.ARCHIVED;
      uniqueRecord.techRecord.push({...uniqueRecord.techRecord[0], statusCode: newStatus});
      let updatedTechRecord;
      try {
        updatedTechRecord = await this.techRecordsDAO.updateSingle(uniqueRecord);
      } catch (error) {
        throw new HTTPError(500, HTTPRESPONSE.INTERNAL_SERVER_ERROR);
      }
      return this.formatTechRecordItemForResponse(updatedTechRecord.Attributes as ITechRecordWrapper);
    } else {
      throw new HTTPError(400, "The tech record status cannot be updated to " + newStatus);
    }
  }

  public static isStatusUpdateRequired(testStatus: string, testResult: string, testTypeId: string): boolean {
    return testStatus === "submitted" && testResult === "pass" &&
      (this.isTestTypeFirstTest(testTypeId) || this.isTestTypeNotifiableAlteration(testTypeId));
  }

  private static isTestTypeFirstTest(testTypeId: string): boolean {
    const firstTestIds = ["41", "95", "65", "66", "67", "103", "104", "82", "83", "119", "120"];
    return firstTestIds.includes(testTypeId);
  }

  private static isTestTypeNotifiableAlteration(testTypeId: string): boolean {
    const notifiableAlterationIds = ["47", "48"];
    return notifiableAlterationIds.includes(testTypeId);
  }

  public async updateEuVehicleCategory(systemNumber: string, newEuVehicleCategory: EU_VEHICLE_CATEGORY): Promise<HTTPResponse | HTTPError> {
    const techRecordWrapper: ITechRecordWrapper = (await this.getTechRecordsList(systemNumber, STATUS.ALL, SEARCHCRITERIA.SYSTEM_NUMBER))[0];
    const nonArchivedTechRecord = techRecordWrapper.techRecord.filter((techRecord) => techRecord.statusCode !== STATUS.ARCHIVED);
    if (nonArchivedTechRecord.length > 1) {
      throw new HTTPError(400, HTTPRESPONSE.EU_VEHICLE_CATEGORY_MORE_THAN_ONE_TECH_RECORD);
    }
    if (nonArchivedTechRecord[0].euVehicleCategory) {
      return new HTTPResponse(200, HTTPRESPONSE.NO_EU_VEHICLE_CATEGORY_UPDATE_REQUIRED);
    }
    const statusCode = nonArchivedTechRecord[0].statusCode;
    const newTechRecord: ITechRecord = {...nonArchivedTechRecord[0]};
    nonArchivedTechRecord[0].statusCode = STATUS.ARCHIVED;
    newTechRecord.euVehicleCategory = newEuVehicleCategory;
    newTechRecord.statusCode = statusCode;
    techRecordWrapper.techRecord.push(newTechRecord);
    let updatedTechRecord;
    try {
      updatedTechRecord = await this.techRecordsDAO.updateSingle(techRecordWrapper);
    } catch (error) {
      throw new HTTPError(500, HTTPRESPONSE.INTERNAL_SERVER_ERROR);
    }
    return new HTTPResponse(200, this.formatTechRecordItemForResponse(updatedTechRecord.Attributes as ITechRecordWrapper));
  }
}

export default TechRecordsService;

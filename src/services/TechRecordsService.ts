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
import {
  validatePayload,
  validatePrimaryVrm,
  validateSecondaryVrms, validateTrailerId
} from "../utils/PayloadValidation";
import {ISearchCriteria} from "../../@Types/ISearchCriteria";
import {populateFields} from "../utils/ValidationUtils";
import HTTPResponse from "../models/HTTPResponse";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import QueryOutput = DocumentClient.QueryOutput;
import {ValidationError, ValidationResult} from "@hapi/joi";
import {formatErrorMessage} from "../utils/formatErrorMessage";
import IMsUserDetails from "../../@Types/IUserDetails";
import {PromiseResult} from "aws-sdk/lib/request";
import {AWSError} from "aws-sdk/lib/error";
import {cloneDeep, mergeWith, isArray, isEqual, differenceWith} from "lodash";

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
    const originalTechRecordItem = cloneDeep(techRecordItem);
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
    if (!this.validateVrms(techRecord)) {
      return Promise.reject({statusCode: 400, body: "Primary or secondaryVrms are not valid"});
    }
    techRecord.systemNumber = await this.generateSystemNumber();
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
    if (vehicleType !== VEHICLE_TYPE.TRL && !techRecord.primaryVrm) {
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

  public updateTechRecord(techRecord: ITechRecordWrapper, msUserDetails: IMsUserDetails, oldStatusCode?: STATUS) {
    return this.manageUpdateLogic(techRecord, msUserDetails, oldStatusCode);
  }

  private manageUpdateLogic(updatedTechRecord: ITechRecordWrapper, msUserDetails: IMsUserDetails, oldStatusCode: STATUS | undefined) {
    return this.createAndArchiveTechRecord(updatedTechRecord, msUserDetails, oldStatusCode)
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

  public async updateAttributesOutsideTechRecordsArray(uniqueRecord: any, techRecord: ITechRecordWrapper) {
    uniqueRecord.secondaryVrms = [];
    for (const vrm of uniqueRecord.vrms) {
      if (vrm.isPrimary) {
        uniqueRecord.primaryVrm = vrm.vrm;
      } else {
        uniqueRecord.secondaryVrms.push(vrm.vrm);
      }
    }
    if (techRecord.secondaryVrms) {
      const areSecondaryVrmsValid = validateSecondaryVrms.validate(techRecord.secondaryVrms);
      if (areSecondaryVrmsValid.error) {
        return Promise.reject({statusCode: 400, body: formatErrorMessage("SecondaryVrms are invalid")});
      }
      uniqueRecord.secondaryVrms = techRecord.secondaryVrms;
    }
    if (techRecord.primaryVrm && uniqueRecord.primaryVrm !== techRecord.primaryVrm) {
      const isPrimaryVrmValid = validatePrimaryVrm.validate(techRecord.primaryVrm);
      if (isPrimaryVrmValid.error) {
        return Promise.reject({statusCode: 400, body: formatErrorMessage("PrimaryVrm is invalid")});
      }
      const primaryVrmRecords: QueryOutput = await this.techRecordsDAO.getBySearchTerm(techRecord.primaryVrm, SEARCHCRITERIA.VRM);
      if (primaryVrmRecords.Count! > 0) {
        return Promise.reject({
          statusCode: 400,
          body: formatErrorMessage(`Primary VRM ${techRecord.primaryVrm} already exists`)
        });
      }
      const previousVrm = uniqueRecord.primaryVrm;
      if (previousVrm) {
        uniqueRecord.secondaryVrms.push(previousVrm);
      }
      uniqueRecord.primaryVrm = techRecord.primaryVrm;
      techRecord.techRecord[0].reasonForCreation = `VRM updated from ${previousVrm} to ${techRecord.primaryVrm}. ` + techRecord.techRecord[0].reasonForCreation;
    }
    if (techRecord.trailerId && techRecord.techRecord[0].vehicleType === VEHICLE_TYPE.TRL && uniqueRecord.trailerId !== techRecord.trailerId) {
      const isTrailerIdValid = validateTrailerId.validate(techRecord.trailerId);
      if (isTrailerIdValid.error) {
        return Promise.reject({statusCode: 400, body: formatErrorMessage("TrailerId is invalid")});
      }
      const trailerIdRecords: QueryOutput = await this.techRecordsDAO.getBySearchTerm(techRecord.trailerId, SEARCHCRITERIA.TRAILERID);
      if (trailerIdRecords.Count! > 0) {
        return Promise.reject({
          statusCode: 400,
          body: formatErrorMessage(`TrailerId ${techRecord.trailerId} already exists`)
        });
      }
      const previousTrailerId = uniqueRecord.trailerId;
      uniqueRecord.trailerId = techRecord.trailerId;
      techRecord.techRecord[0].reasonForCreation = `Trailer Id updated from ${previousTrailerId} to ${techRecord.trailerId}. ` + techRecord.techRecord[0].reasonForCreation;
    }
  }

  public async createAndArchiveTechRecord(updatedTechRecord: ITechRecordWrapper, msUserDetails: IMsUserDetails, oldStatusCode: STATUS | undefined) {
    const {statusCode} = updatedTechRecord.techRecord[0];

    if ((oldStatusCode && oldStatusCode === STATUS.ARCHIVED) || statusCode === STATUS.ARCHIVED) {
      return Promise.reject({statusCode: 400, body: formatErrorMessage(ERRORS.CANNOT_USE_UPDATE_TO_ARCHIVE)});
    }
    if (oldStatusCode && oldStatusCode === STATUS.CURRENT && statusCode === STATUS.PROVISIONAL) {
      return Promise.reject({statusCode: 400, body: formatErrorMessage(ERRORS.CANNOT_CHANGE_CURRENT_TO_PROVISIONAL)});
    }
    const isPayloadValid = validatePayload(updatedTechRecord.techRecord[0]);
    this.checkValidationErrors(isPayloadValid);

    updatedTechRecord.techRecord[0] = isPayloadValid.value;
    return this.getTechRecordsList(updatedTechRecord.systemNumber, STATUS.ALL, SEARCHCRITERIA.SYSTEM_NUMBER)
      .then(async (data: ITechRecordWrapper[]) => {
        if (data.length !== 1) {
          // systemNumber search should return a unique record
          throw new HTTPError(500, ERRORS.NO_UNIQUE_RECORD);
        }
        const techRecordWithAllStatues = data[0];
        const statusCodeToSearch: string = oldStatusCode ? oldStatusCode : statusCode;
        await this.updateAttributesOutsideTechRecordsArray(techRecordWithAllStatues, updatedTechRecord);
        const techRecToArchive = this.getTechRecordToArchive(techRecordWithAllStatues, statusCodeToSearch);
        const currentTechRec = techRecordWithAllStatues.techRecord.find((techRec) => techRec.statusCode === STATUS.CURRENT);
        // check if vehicle already has a current and the provisional has been updated to current the mark old current as archived
        if (currentTechRec && oldStatusCode && oldStatusCode === STATUS.PROVISIONAL && statusCode === STATUS.CURRENT) {
          currentTechRec.statusCode = STATUS.ARCHIVED;
          const date = new Date().toISOString();
          currentTechRec.lastUpdatedAt = date;
          currentTechRec.lastUpdatedByName = msUserDetails.msUser;
          currentTechRec.lastUpdatedById = msUserDetails.msOid;
        }
        const newRecord: ITechRecord = cloneDeep(techRecToArchive);
        mergeWith(newRecord, updatedTechRecord.techRecord[0], this.arrayCustomizer);
        if (oldStatusCode) {
          newRecord.statusCode = statusCode;
        }
        this.setAuditDetails(newRecord, techRecToArchive, msUserDetails);
        techRecToArchive.statusCode = STATUS.ARCHIVED;
        populateFields(newRecord);
        techRecordWithAllStatues.techRecord.push(newRecord);
        return techRecordWithAllStatues;
      })
      .catch((error: any) => {
        throw new HTTPError(error.statusCode, error.body);
      });
  }

  private arrayCustomizer(objValue: any, srcValue: any) {
    if (isArray(objValue) && isArray(srcValue)) {
      return srcValue;
    }
  }

  public getTechRecordToArchive(techRecord: ITechRecordWrapper, statusCode: string) {
    const recordsToArchive = techRecord.techRecord.filter((record) => record.statusCode === statusCode);
    if (recordsToArchive.length > 1) {
      throw new HTTPError(500, `Vehicle has more than one tech-record with status ${statusCode}`);
    } else if (recordsToArchive.length === 0) {
      throw new HTTPError(404, `Vehicle has no tech-records with status ${statusCode}`);
    } else {
      return recordsToArchive[0];
    }
  }

  private setAuditDetails(newTechRecord: ITechRecord, oldTechRecord: ITechRecord, msUserDetails: IMsUserDetails) {
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
      updateType = isEqual(newTechRecord.adrDetails, oldTechRecord.adrDetails) ? UPDATE_TYPE.TECH_RECORD_UPDATE : UPDATE_TYPE.ADR;
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

  public setCreatedAuditDetails(techRecord: ITechRecord, createdByName: string, createdById: string, date: string) {
    techRecord.createdAt = date;
    techRecord.createdByName = createdByName;
    techRecord.createdById = createdById;
    delete techRecord.lastUpdatedAt;
    delete techRecord.lastUpdatedById;
    delete techRecord.lastUpdatedByName;
  }

  public setLastUpdatedAuditDetails(techRecord: ITechRecord, createdByName: string, createdById: string, date: string) {
    techRecord.lastUpdatedAt = date;
    techRecord.lastUpdatedByName = createdByName;
    techRecord.lastUpdatedById = createdById;
  }

  public async prepareTechRecordForStatusUpdate(systemNumber: string, newStatus: STATUS = STATUS.CURRENT, createdById: string, createdByName: string) {
    const techRecordWrapper: ITechRecordWrapper[] = await this.getTechRecordsList(systemNumber, STATUS.ALL, SEARCHCRITERIA.SYSTEM_NUMBER);
    if (techRecordWrapper.length !== 1) {
      // systemNumber search should return a single record
      throw new HTTPError(500, ERRORS.NO_UNIQUE_RECORD);
    }
    const uniqueRecord = techRecordWrapper[0];
    const provisionalTechRecords = uniqueRecord.techRecord.filter((techRecord) => techRecord.statusCode === STATUS.PROVISIONAL);
    const currentTechRecords = uniqueRecord.techRecord.filter((techRecord) => techRecord.statusCode === STATUS.CURRENT);
    let newTechRecord;
    if (provisionalTechRecords.length === 1) {
      provisionalTechRecords[0].statusCode = STATUS.ARCHIVED;
      newTechRecord = cloneDeep(provisionalTechRecords[0]);
      newTechRecord.statusCode = newStatus;

      const date = new Date().toISOString();
      this.setCreatedAuditDetails(newTechRecord, createdByName, createdById, date);
      this.setLastUpdatedAuditDetails(provisionalTechRecords[0], createdByName, createdById, date);
      provisionalTechRecords[0].updateType = UPDATE_TYPE.TECH_RECORD_UPDATE;
    }
    if (currentTechRecords.length === 1) {
      currentTechRecords[0].statusCode = STATUS.ARCHIVED;
      const date = new Date().toISOString();
      if (!newTechRecord) {
        newTechRecord = cloneDeep(currentTechRecords[0]);
        newTechRecord.statusCode = newStatus;
        this.setCreatedAuditDetails(newTechRecord, createdByName, createdById, date);
      }
      this.setLastUpdatedAuditDetails(currentTechRecords[0], createdByName, createdById, date);
      currentTechRecords[0].updateType = UPDATE_TYPE.TECH_RECORD_UPDATE;
    }

    // if newTechRecord is undefined that means there multiple or no current/provisional records were found
    if (!newTechRecord) {
      throw new HTTPError(400, "The tech record status cannot be updated to " + newStatus);
    }
    uniqueRecord.techRecord.push(newTechRecord);
    return uniqueRecord;
  }

  public async updateTechRecordStatusCode(systemNumber: string, newStatus: STATUS = STATUS.CURRENT, createdById: string, createdByName: string) {
    const uniqueRecord = await this.prepareTechRecordForStatusUpdate(systemNumber, newStatus, createdById, createdByName);
    let updatedTechRecord;
    try {
      updatedTechRecord = await this.techRecordsDAO.updateSingle(uniqueRecord);
    } catch (error) {
      throw new HTTPError(500, HTTPRESPONSE.INTERNAL_SERVER_ERROR);
    }
    return this.formatTechRecordItemForResponse(updatedTechRecord.Attributes as ITechRecordWrapper);
  }

  public async archiveTechRecordStatus(systemNumber: string, techRecordToUpdate: ITechRecordWrapper, userDetails: IMsUserDetails) {
    const allTechRecordWrapper: ITechRecordWrapper[] = await this.getTechRecordsList(systemNumber, STATUS.ALL, SEARCHCRITERIA.SYSTEM_NUMBER);
    if (allTechRecordWrapper.length !== 1) {
      // systemNumber search should return a single record
      throw new HTTPError(400, formatErrorMessage(ERRORS.NO_UNIQUE_RECORD));
    }
    const techRecordWithAllStatues = allTechRecordWrapper[0];
    const techRecordToArchive = this.getTechRecordToArchive(techRecordWithAllStatues, techRecordToUpdate.techRecord[0].statusCode);
    if (techRecordToArchive.statusCode === STATUS.ARCHIVED) {
      throw new HTTPError(400, formatErrorMessage(ERRORS.CANNOT_UPDATE_ARCHIVED_RECORD));
    }
    if (!isEqual(techRecordToArchive, techRecordToUpdate.techRecord[0])) {
      throw new HTTPError(400, formatErrorMessage(ERRORS.CANNOT_ARCHIVE_CHANGED_RECORD));
    }
    techRecordToArchive.statusCode = STATUS.ARCHIVED;
    techRecordToArchive.lastUpdatedAt = new Date().toISOString();
    techRecordToArchive.lastUpdatedByName = userDetails.msUser;
    techRecordToArchive.lastUpdatedById = userDetails.msOid;
    techRecordToArchive.updateType = UPDATE_TYPE.TECH_RECORD_UPDATE;

    let updatedTechRecord;
    try {
      updatedTechRecord = await this.techRecordsDAO.updateSingle(techRecordWithAllStatues);
    } catch (error) {
      throw new HTTPError(error.statusCode, error.message);
    }
    return this.formatTechRecordItemForResponse(updatedTechRecord.Attributes as ITechRecordWrapper);
  }

  public static isStatusUpdateRequired(testStatus: string, testResult: string, testTypeId: string): boolean {
    return testStatus === "submitted" && (testResult === "pass" || testResult === "prs") &&
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

  private getTechRecordByStatus(techRecordList: ITechRecordWrapper, statusCode: string) {
    return techRecordList.techRecord.filter((techRecord) => techRecord.statusCode === statusCode);
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

  public addProvisionalTechRecord(techRecord: ITechRecordWrapper, msUserDetails: IMsUserDetails) {
    return this.addNewProvisionalRecord(techRecord, msUserDetails)
      .then((data: ITechRecordWrapper) => {
        return this.techRecordsDAO.updateSingle(data)
          .then((updatedData: PromiseResult<DocumentClient.UpdateItemOutput, AWSError>) => {
            return this.formatTechRecordItemForResponse({...updatedData.Attributes} as ITechRecordWrapper);
          })
          .catch((error: any) => {
            throw new HTTPError(error.statusCode, error.message);
          });
      })
      .catch((error: any) => {
        throw new HTTPError(error.statusCode, error.body);
      });
  }

  public addNewProvisionalRecord(techRecordToAdd: ITechRecordWrapper, msUserDetails: IMsUserDetails) {
    if (techRecordToAdd.techRecord[0].statusCode !== STATUS.PROVISIONAL) {
      return Promise.reject({statusCode: 400, body: ERRORS.STATUS_CODE_SHOULD_BE_PROVISIONAL});
    }
    const isPayloadValid = validatePayload(techRecordToAdd.techRecord[0]);
    if (isPayloadValid.error) {
      return Promise.reject({statusCode: 400, body: isPayloadValid.error.details});
    }
    return this.getTechRecordsList(techRecordToAdd.systemNumber, STATUS.ALL, SEARCHCRITERIA.SYSTEM_NUMBER)
      .then((data: ITechRecordWrapper[]) => {
        if (data.length !== 1) {
          // systemNumber search should return a unique record
          throw new HTTPError(500, ERRORS.NO_UNIQUE_RECORD);
        }
        const uniqueRecord = data[0];
        if (this.getTechRecordByStatus(uniqueRecord, STATUS.PROVISIONAL).length > 0) {
          throw new HTTPError(400, ERRORS.CURRENT_OR_PROVISIONAL_RECORD_FOUND);
        }
        techRecordToAdd.techRecord[0].createdAt = new Date().toISOString();
        techRecordToAdd.techRecord[0].createdByName = msUserDetails.msUser;
        techRecordToAdd.techRecord[0].createdById = msUserDetails.msOid;
        delete techRecordToAdd.techRecord[0].lastUpdatedAt;
        delete techRecordToAdd.techRecord[0].lastUpdatedById;
        delete techRecordToAdd.techRecord[0].lastUpdatedByName;
        techRecordToAdd.techRecord[0].updateType = UPDATE_TYPE.TECH_RECORD_UPDATE;
        uniqueRecord.techRecord.push(techRecordToAdd.techRecord[0]);
        return uniqueRecord;
      })
      .catch((error: any) => {
        throw new HTTPError(error.statusCode, error.body);
      });
  }
}

export default TechRecordsService;

import { cloneDeep, mergeWith, isArray, isEqual } from "lodash";
import {
  Vehicle,
  TechRecord,
  Trailer,
  PsvTechRecord,
} from "../../../@Types/TechRecords";
import IMsUserDetails from "../../../@Types/IUserDetails";
import * as enums from "../../assets/Enums";
import * as validators from "../../utils/validations";
import * as handlers from "../../handlers";
import { computeRecordCompleteness } from "../../utils/record-completeness/ComputeRecordCompleteness";
import TechRecordsDAO from "../../models/TechRecordsDAO";
import HTTPResponse from "../../models/HTTPResponse";
import ITechRecord from "../../../@Types/ITechRecord";
import { STATUS_CODES } from "http";

export abstract class VehicleProcessor<T extends Vehicle> {
  protected vehicle: T;
  protected validationOptions: any;
  protected readonly numberGenerator: handlers.NumberGenerator;
  private readonly techRecordsListHandler: handlers.TechRecordsListHandler<T>;
  private readonly auditHandler: handlers.AuditDetailsHandler;
  private readonly Error = handlers.ErrorHandler.Error;

  protected constructor(
    vehicleObj: T,
    protected techRecordDAO: TechRecordsDAO
  ) {
    this.vehicle = vehicleObj;
    this.validationOptions = { abortEarly: false };
    this.numberGenerator = new handlers.NumberGenerator(this.techRecordDAO);
    this.techRecordsListHandler = new handlers.TechRecordsListHandler(
      this.techRecordDAO
    );
    this.auditHandler = new handlers.AuditDetailsHandler();
  }

  /* #region  Protected functions */
  /**
   * Validates tech record based on vehicle type and returns string array of error messages
   * @param techRecord the techRecord to be validated
   */
  protected abstract validateTechRecordFields(
    techRecord: TechRecord,
    isCreate?: boolean
  ): string[];
  /**
   * map attributes to the tech record based on vehicle type
   * @param techRecord techRecord to be mapped
   */
  protected abstract mapFields(techRecord: TechRecord): TechRecord;

  /**
   * Returns the system number or trailer id based on vehicle type
   */
  protected abstract async setNumberKey(): Promise<void>;

  /**
   * update the vehicle identifier attributes
   * @param existingVehicle The existing tech record
   * @param updatedVehicle The updated tech record
   */
  protected updateVehicleIdentifiers(existingVehicle: T, updatedVehicle: T): T {
    const { primaryVrm } = updatedVehicle;
    const previousPrimaryVrm = existingVehicle.primaryVrm;
    existingVehicle.secondaryVrms = updatedVehicle.secondaryVrms;
    if (!primaryVrm || previousPrimaryVrm === primaryVrm) {
      return updatedVehicle;
    }

    updatedVehicle.techRecord[0].reasonForCreation =
    `VRM updated from ${previousPrimaryVrm} to ${primaryVrm}. ` +
    updatedVehicle.techRecord[0].reasonForCreation; 


    return updatedVehicle;
  }

  /**
   * Validate VRMs in payload with existing VRMs
   * @param newVehicle TechRecord received in a payload
   * @param existingVehicle TechRecord in the database
   */
  protected async validateVrmWithHistory(newVehicle: T, existingVehicle: T) {
    const errors: string[] = [];
    const { primaryVrm } = newVehicle;
    if (primaryVrm && existingVehicle.primaryVrm !== primaryVrm) {
      const primaryVrmRecords = await this.techRecordDAO.getBySearchTerm(
        primaryVrm,
        enums.SEARCHCRITERIA.VRM
      );

      const allTechRecords: ITechRecord[] = [];
      primaryVrmRecords
        .map((wrapper) => wrapper.techRecord)
        .forEach((techRecord) => allTechRecords.push(...techRecord));

      if (
        !allTechRecords.every(
          (record) => record.statusCode === enums.STATUS.ARCHIVED
        )
      ) {
        errors.push(`Primary VRM ${primaryVrm} already exists`);
      }
    }
    return errors;
  }

  /**
   * Set all vehicle identifiers to upper case
   * @param vehicle the input parameter
   */
  protected capitaliseGeneralVehicleAttributes(vehicle: T) {
    const toUpper = (str: string = "") => str.toUpperCase();
    vehicle.vin = toUpper(vehicle.vin);
    vehicle.partialVin = toUpper(vehicle.partialVin || "");
    vehicle.primaryVrm = toUpper(vehicle.primaryVrm || "");
    vehicle.secondaryVrms = vehicle.secondaryVrms?.map(toUpper);
    return vehicle;
  }
  /* #endregion */

  /* #region  Public functions */
  /**
   * validates and inserts a new tech record in the database
   * @param msUserDetails the user who created the tech record
   */
  public async createVehicle(msUserDetails: IMsUserDetails): Promise<T> {
    try {
      this.vehicle = await this.validateAndMapTechRecord(msUserDetails);
      const data = await this.techRecordDAO.createSingle(this.vehicle);
      return data.Attributes as T;
    } catch (error) {
      console.error(error);
      const errorList = error.body ? error.body.errors : error.message;
      throw this.Error(error.statusCode, errorList);
    }
  }

  /**
   * Validate and update tech record
   * @param msUserDetails the user who has made changes to the record.
   * @param oldStatusCode the old status code of the tech record. It will be passed if the user changes this value.
   */
  public async updateVehicle(
    msUserDetails: IMsUserDetails,
    oldStatusCode?: enums.STATUS
  ) {
    try {
      const data = await this.createAndArchiveTechRecord(
        this.vehicle,
        msUserDetails,
        oldStatusCode
      );
      const updatedData = await this.techRecordDAO.updateSingle(data);
      return this.techRecordsListHandler.formatTechRecordItemForResponse(
        updatedData.Attributes as T
      );
    } catch (error) {
      console.error(error);
      throw handlers.ErrorHandler.Error(error.statusCode, error.body.errors);
    }
  }

  public async addNewProvisionalRecord(
    msUserDetails: IMsUserDetails
  ): Promise<T> {
    if (this.vehicle.techRecord[0].statusCode !== enums.STATUS.PROVISIONAL) {
      throw this.Error(400, enums.ERRORS.STATUS_CODE_SHOULD_BE_PROVISIONAL);
    }

    try {
      this.validate(this.vehicle, false);
      const vehiclesFromDB =
        await this.techRecordsListHandler.getFormattedTechRecordsList(
          this.vehicle.systemNumber,
          enums.STATUS.ALL,
          enums.SEARCHCRITERIA.SYSTEM_NUMBER
        );
      if (vehiclesFromDB.length !== 1) {
        throw this.Error(500, enums.ERRORS.NO_UNIQUE_RECORD);
      }
      const uniqueRecord = vehiclesFromDB[0];

      if (
        uniqueRecord.techRecord.filter(
          (techRecord) => techRecord.statusCode === enums.STATUS.PROVISIONAL
        ).length
      ) {
        throw this.Error(400, enums.ERRORS.CURRENT_OR_PROVISIONAL_RECORD_FOUND);
      }

      this.auditHandler.setCreatedAuditDetails(
        this.vehicle.techRecord[0],
        msUserDetails.msUser,
        msUserDetails.msOid,
        new Date().toISOString()
      );

      this.vehicle.techRecord[0].updateType =
        enums.UPDATE_TYPE.TECH_RECORD_UPDATE;
      uniqueRecord.techRecord.push(this.vehicle.techRecord[0]);
      await this.techRecordDAO.updateSingle(uniqueRecord);
      return this.techRecordsListHandler.formatTechRecordItemForResponse(
        uniqueRecord
      );
    } catch (error) {
      console.error(error);
      throw this.Error(error.statusCode, error.body);
    }
  }

  public async updateTechRecordStatusCode(uniqueRecord: T) {
    let updatedTechRecord;
    try {
      updatedTechRecord = await this.techRecordDAO.updateSingle(uniqueRecord);
    } catch (error) {
      console.error(error);
      throw this.Error(500, enums.HTTPRESPONSE.INTERNAL_SERVER_ERROR);
    }
    return this.techRecordsListHandler.formatTechRecordItemForResponse(
      updatedTechRecord.Attributes as T
    );
  }

  public async archiveTechRecordStatus(
    systemNumber: string,
    techRecordToUpdate: T,
    userDetails: IMsUserDetails,
    reasonForArchiving: string
  ) {
    const allTechRecordWrapper =
      await this.techRecordsListHandler.getTechRecordList(
        systemNumber,
        enums.STATUS.ALL,
        enums.SEARCHCRITERIA.SYSTEM_NUMBER
      );
    if (allTechRecordWrapper.length !== 1) {
      // systemNumber search should return a single record
      throw this.Error(400, enums.ERRORS.NO_UNIQUE_RECORD);
    }
    const techRecordWithAllStatues = allTechRecordWrapper[0];
    const techRecordToArchive = VehicleProcessor.getTechRecordToArchive(
      techRecordWithAllStatues,
      techRecordToUpdate.techRecord[0].statusCode
    );
    if (techRecordToArchive.statusCode === enums.STATUS.ARCHIVED) {
      throw this.Error(400, enums.ERRORS.CANNOT_UPDATE_ARCHIVED_RECORD);
    }
    if (!isEqual(techRecordToArchive, techRecordToUpdate.techRecord[0])) {
      throw this.Error(400, enums.ERRORS.CANNOT_ARCHIVE_CHANGED_RECORD);
    }
    techRecordToArchive.statusCode = enums.STATUS.ARCHIVED;
    techRecordToArchive.lastUpdatedAt = new Date().toISOString();
    techRecordToArchive.lastUpdatedByName = userDetails.msUser;
    techRecordToArchive.lastUpdatedById = userDetails.msOid;
    techRecordToArchive.updateType = enums.UPDATE_TYPE.TECH_RECORD_UPDATE;
    if (techRecordToArchive.vehicleType === enums.VEHICLE_TYPE.PSV) {
      const remarks = (techRecordToArchive as PsvTechRecord).remarks;
      (techRecordToArchive as PsvTechRecord).remarks = remarks
        ? remarks + `\n${reasonForArchiving}`
        : reasonForArchiving;
    } else {
      const notes = (techRecordToArchive as ITechRecord).notes;
      (techRecordToArchive as ITechRecord).notes = notes
        ? notes + `\n${reasonForArchiving}`
        : reasonForArchiving;
    }

    let updatedTechRecord;
    try {
      updatedTechRecord = await this.techRecordDAO.updateSingle(
        techRecordWithAllStatues
      );
    } catch (error) {
      console.error(error);
      throw this.Error(error.statusCode, error.message);
    }
    return this.techRecordsListHandler.formatTechRecordItemForResponse(
      updatedTechRecord.Attributes as T
    );
  }

  public async updateEuVehicleCategory(
    systemNumber: string,
    newEuVehicleCategory: enums.EU_VEHICLE_CATEGORY,
    msUserDetails: IMsUserDetails
  ) {
    const techRecordWrapper = (
      await this.techRecordsListHandler.getTechRecordList(
        systemNumber,
        enums.STATUS.ALL,
        enums.SEARCHCRITERIA.SYSTEM_NUMBER
      )
    )[0];
    const nonArchivedTechRecord = techRecordWrapper.techRecord.filter(
      (techRecord) => techRecord.statusCode !== enums.STATUS.ARCHIVED
    );
    if (nonArchivedTechRecord.length > 1) {
      throw this.Error(
        400,
        enums.HTTPRESPONSE.EU_VEHICLE_CATEGORY_MORE_THAN_ONE_TECH_RECORD
      );
    }
    if (nonArchivedTechRecord.length === 0) {
      throw this.Error(400, enums.ERRORS.CANNOT_UPDATE_ARCHIVED_RECORD);
    }
    if (nonArchivedTechRecord[0].euVehicleCategory) {
      return new HTTPResponse(
        200,
        enums.HTTPRESPONSE.NO_EU_VEHICLE_CATEGORY_UPDATE_REQUIRED
      );
    }
    const statusCode = nonArchivedTechRecord[0].statusCode;
    const newTechRecord: TechRecord = cloneDeep(nonArchivedTechRecord[0]);
    nonArchivedTechRecord[0].statusCode = enums.STATUS.ARCHIVED;
    newTechRecord.euVehicleCategory = newEuVehicleCategory;
    newTechRecord.statusCode = statusCode;
    this.auditHandler.setAuditDetails(
      newTechRecord,
      nonArchivedTechRecord[0],
      msUserDetails
    );
    techRecordWrapper.techRecord.push(newTechRecord);
    let updatedTechRecord;
    try {
      updatedTechRecord = await this.techRecordDAO.updateSingle(
        techRecordWrapper
      );
    } catch (error) {
      throw this.Error(500, enums.HTTPRESPONSE.INTERNAL_SERVER_ERROR);
    }
    return new HTTPResponse(
      200,
      this.techRecordsListHandler.formatTechRecordItemForResponse(
        updatedTechRecord.Attributes as T
      )
    );
  }
  /* #endregion */

  /* #region  Private functions */

  private async validateAndMapTechRecord(msUserDetails: IMsUserDetails) {
    this.vehicle.techRecord[0] = this.validate(this.vehicle, true);
    await this.setNumberKey();
    this.vehicle.techRecord[0] = this.mapFields(this.vehicle.techRecord[0]);
    this.vehicle = this.capitaliseGeneralVehicleAttributes(this.vehicle);
    this.auditHandler.setAuditDetailsAndStatusCodeForNewRecord(
      this.vehicle.techRecord[0],
      msUserDetails
    );
    this.vehicle.techRecord[0].recordCompleteness = computeRecordCompleteness(
      this.vehicle
    );
    return this.vehicle;
  }

  /**
   * to create a new tech and archive the existing techRecord
   * @param updatedVehicle the vehicle with the updated techRecord
   * @param msUserDetails the user making the update
   * @param oldStatusCode the old status of the updated techRecord. This is an optional parameter and only needs to be passed if status is updated.
   */
  private async createAndArchiveTechRecord(
    updatedVehicle: T,
    msUserDetails: IMsUserDetails,
    oldStatusCode: enums.STATUS | undefined
  ): Promise<T> {
    const { statusCode } = updatedVehicle.techRecord[0];

    VehicleProcessor.checkStatusCodeValidity(statusCode, oldStatusCode);

    updatedVehicle.techRecord[0] = this.validate(updatedVehicle, false);

    try {
      const techRecordWithAllStatuses = await this.getTechRecordList(
        updatedVehicle.systemNumber
      );

      const errors = await this.validateVrmWithHistory(
        updatedVehicle,
        techRecordWithAllStatuses
      );
      if (errors && errors.length) {
        throw this.Error(400, errors);
      }
      const techRecToArchive = VehicleProcessor.getTechRecordToArchive(
        techRecordWithAllStatuses,
        oldStatusCode ? oldStatusCode : statusCode
      );
        
      techRecToArchive.historicPrimaryVrm = techRecordWithAllStatuses.primaryVrm
      techRecToArchive.historicSecondaryVrms = techRecordWithAllStatuses.secondaryVrms
      // if status code has changed from provisional to current
      this.updateCurrentStatusCode(
        oldStatusCode,
        statusCode,
        techRecordWithAllStatuses,
        msUserDetails
      );
      updatedVehicle = this.updateVehicleIdentifiers(
        techRecordWithAllStatuses,
        updatedVehicle
      );
      updatedVehicle = this.capitaliseGeneralVehicleAttributes(updatedVehicle);
        
      if (updatedVehicle.techRecord[0].vehicleType === enums.VEHICLE_TYPE.TRL) {
        // @ts-ignore
        techRecordWithAllStatuses.trailerId = updatedVehicle.trailerId;
      }
      const newRecord: TechRecord = cloneDeep(updatedVehicle.techRecord[0]);
      if (oldStatusCode) {
        newRecord.statusCode = statusCode;
      }
      newRecord.historicPrimaryVrm = undefined;
      newRecord.historicSecondaryVrms = undefined;
      this.auditHandler.setAuditDetails(
        newRecord,
        techRecToArchive,
        msUserDetails
      );
      techRecToArchive.statusCode = enums.STATUS.ARCHIVED;
      this.mapFields(newRecord);
      const { systemNumber, vin, primaryVrm } = techRecordWithAllStatuses;
      const vehicleToUpdate = {
        systemNumber,
        vin,
        primaryVrm,
        techRecord: [newRecord],
      } as T;
      if (updatedVehicle.techRecord[0].vehicleType === enums.VEHICLE_TYPE.TRL) {
        (vehicleToUpdate as unknown as Trailer).trailerId = (
          updatedVehicle as unknown as Trailer
        ).trailerId;
      }
      newRecord.recordCompleteness = computeRecordCompleteness(vehicleToUpdate);
      techRecordWithAllStatuses.techRecord.push(newRecord);
      return techRecordWithAllStatuses;
    } catch (error) {
      console.error(error);
      throw this.Error(error.statusCode, error.body);
    }
  }

  /**
   * To validate common attributes for all vehicles and specific attributes based on vehicle type.
   * @param newVehicle vehicle to validate
   * @param isCreate true if it is a create request else false
   */
  private validate(newVehicle: T, isCreate: boolean): TechRecord {
    let errors: string[] = [];
    const isPrimaryVrmRequired = this.vehicle.techRecord[0].vehicleType !== enums.VEHICLE_TYPE.TRL;
    const {primaryVrm, secondaryVrms} = this.vehicle;
    
    // validate if it's not create or primaryVrm is truthy
    const validatePrimaryVrm = !isCreate || primaryVrm;
    const validateSecondaryVrms = isCreate || secondaryVrms;

    errors = errors.concat(validatePrimaryVrm ? validators.primaryVrmValidator(primaryVrm, isPrimaryVrmRequired):[]);
    errors = errors.concat(validateSecondaryVrms ? validators.secondaryVrmValidator(secondaryVrms):[]);
    errors = errors.concat(this.validateTechRecordFields(newVehicle.techRecord[0], isCreate));

    if (errors && errors.length) {
      console.error(errors);
      throw this.Error(400, errors);
    }
    
    return newVehicle.techRecord[0];
  }

  private updateCurrentStatusCode(
    oldStatusCode: enums.STATUS | undefined,
    statusCode: string,
    techRecordWithAllStatuses: T,
    msUserDetails: IMsUserDetails
  ) {
    if (
      oldStatusCode &&
      oldStatusCode === enums.STATUS.PROVISIONAL &&
      statusCode === enums.STATUS.CURRENT
    ) {
      const currentTechRec = techRecordWithAllStatuses.techRecord.find(
        (techRec) => techRec.statusCode === enums.STATUS.CURRENT
      );
      // check if vehicle already has a current
      if (currentTechRec) {
        currentTechRec.statusCode = enums.STATUS.ARCHIVED;
        const date = new Date().toISOString();
        this.auditHandler.setLastUpdatedAuditDetails(
          currentTechRec,
          msUserDetails.msUser,
          msUserDetails.msOid,
          date
        );
      }
    }
  }

  private async getTechRecordList(systemNumber: string) {
    const data = await this.techRecordsListHandler.getTechRecordList(
      systemNumber,
      enums.STATUS.ALL,
      enums.SEARCHCRITERIA.SYSTEM_NUMBER
    );
    if (data.length !== 1) {
      // systemNumber search should return a unique record
      throw this.Error(500, enums.ERRORS.NO_UNIQUE_RECORD);
    }
    return data[0];
  }

  private static getTechRecordToArchive(
    techRecord: Vehicle,
    statusCode: string
  ): TechRecord {
    const recordsToArchive = techRecord.techRecord.filter(
      (record) => record.statusCode === statusCode
    );

    if (recordsToArchive.length > 1) {
      throw handlers.ErrorHandler.Error(
        500,
        `Vehicle has more than one tech-record with status ${statusCode}`
      );
    }

    if (recordsToArchive.length === 0) {
      throw handlers.ErrorHandler.Error(
        404,
        `Vehicle has no tech-records with status ${statusCode}`
      );
    }
    return recordsToArchive[0];
  }

  private static arrayCustomizer(objValue: any, srcValue: any) {
    if (isArray(objValue) && isArray(srcValue)) {
      return srcValue;
    }
  }

  private static checkStatusCodeValidity(
    statusCode: string,
    oldStatusCode?: string
  ) {
    if (
      oldStatusCode === enums.STATUS.ARCHIVED ||
      statusCode === enums.STATUS.ARCHIVED
    ) {
      throw handlers.ErrorHandler.Error(
        400,
        enums.ERRORS.CANNOT_USE_UPDATE_TO_ARCHIVE
      );
    }
    if (
      oldStatusCode === enums.STATUS.CURRENT &&
      statusCode === enums.STATUS.PROVISIONAL
    ) {
      throw handlers.ErrorHandler.Error(
        400,
        enums.ERRORS.CANNOT_CHANGE_CURRENT_TO_PROVISIONAL
      );
    }
  }
  /* #endregion */
}

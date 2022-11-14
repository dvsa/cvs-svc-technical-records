import {ERRORS, SEARCHCRITERIA, STATUS, UPDATE_TYPE} from "../assets/Enums";
import HTTPError from "../models/HTTPError";
import {cloneDeep} from "lodash";
import * as handlers from "./index";
import {Vehicle} from "../../@Types/TechRecords";


export class TechRecordStatusHandler<T extends Vehicle> {
  private techRecordsListHandler: handlers.TechRecordsListHandler<T>;
  private readonly auditHandler: handlers.AuditDetailsHandler;

  constructor(techRecordsListHandler: handlers.TechRecordsListHandler<T>) {
    this.techRecordsListHandler = techRecordsListHandler;
    this.auditHandler = new handlers.AuditDetailsHandler();
  }

  public async prepareTechRecordForStatusUpdate(systemNumber: string, newStatus: STATUS = STATUS.CURRENT, createdById: string, createdByName: string): Promise<T> {
    const techRecordWrapper = await this.techRecordsListHandler.getFormattedTechRecordsList(systemNumber, STATUS.ALL, SEARCHCRITERIA.SYSTEM_NUMBER);
    if (techRecordWrapper.length !== 1) {
      // systemNumber search should return a single record
      throw new HTTPError(500, ERRORS.NO_UNIQUE_RECORD);
    }
    const uniqueRecord = techRecordWrapper[0];
    const provisionalTechRecords = uniqueRecord.techRecord.filter((techRecord) => techRecord.statusCode === STATUS.PROVISIONAL);
    const currentTechRecords = uniqueRecord.techRecord.filter((techRecord) => techRecord.statusCode === STATUS.CURRENT);
    let newTechRecord;
    if (provisionalTechRecords.length === 1) {
      provisionalTechRecords[0].statusCode = STATUS.REMOVED;
      newTechRecord = cloneDeep(provisionalTechRecords[0]);
      newTechRecord.statusCode = newStatus;

      const date = new Date().toISOString();
      this.auditHandler.setCreatedAuditDetails(newTechRecord, createdByName, createdById, date);
      this.auditHandler.setLastUpdatedAuditDetails(provisionalTechRecords[0], createdByName, createdById, date);
      provisionalTechRecords[0].updateType = UPDATE_TYPE.TECH_RECORD_UPDATE;
    }
    if (currentTechRecords.length === 1) {
      currentTechRecords[0].statusCode = STATUS.ARCHIVED;
      const date = new Date().toISOString();
      if (!newTechRecord) {
        newTechRecord = cloneDeep(currentTechRecords[0]);
        newTechRecord.statusCode = newStatus;
        this.auditHandler.setCreatedAuditDetails(newTechRecord, createdByName, createdById, date);
      }
      this.auditHandler.setLastUpdatedAuditDetails(currentTechRecords[0], createdByName, createdById, date);
      currentTechRecords[0].updateType = UPDATE_TYPE.TECH_RECORD_UPDATE;
    }

    // if newTechRecord is undefined that means there multiple or no current/provisional records were found
    if (!newTechRecord) {
      throw new HTTPError(400, "The tech record status cannot be updated to " + newStatus);
    }
    uniqueRecord.techRecord.push(newTechRecord);
    return uniqueRecord;
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
    const notifiableAlterationIds = ["38", "47", "48"];
    return notifiableAlterationIds.includes(testTypeId);
  }
}

import {STATUS, STATUS_CODES, UPDATE_TYPE} from "../assets/Enums";
import IMsUserDetails from "../../@Types/IUserDetails";
import {TechRecord} from "../../@Types/TechRecords";
import {isEqual} from "lodash";

export class AuditDetailsHandler {

  public setAuditDetails<TechRec extends TechRecord>(newTechRecord: TechRec, oldTechRecord: TechRec, msUserDetails: IMsUserDetails, inputDate?: Date) {
    const date = inputDate ? inputDate.toISOString() : new Date().toISOString();

    this.setCreatedAuditDetails(newTechRecord, msUserDetails.msUser, msUserDetails.msOid, date);
    this.setLastUpdatedAuditDetails(oldTechRecord, msUserDetails.msUser, msUserDetails.msOid, date);

    // TODO - implement setUpdateType based on vehicle type
    let updateType = UPDATE_TYPE.TECH_RECORD_UPDATE;
    // @ts-ignore
    if (newTechRecord.adrDetails || oldTechRecord.adrDetails) {
      // @ts-ignore
      updateType = isEqual(newTechRecord.adrDetails, oldTechRecord.adrDetails) ? UPDATE_TYPE.TECH_RECORD_UPDATE : UPDATE_TYPE.ADR;
    }
    oldTechRecord.updateType = updateType;
  }

  public setAuditDetailsAndStatusCodeForNewRecord<TechRec extends TechRecord>(techRecord: TechRec, msUserDetails: IMsUserDetails) {
    techRecord.createdAt = new Date().toISOString();
    techRecord.createdByName = msUserDetails.msUser;
    techRecord.createdById = msUserDetails.msOid;
    techRecord.statusCode = STATUS_CODES.includes(techRecord.statusCode) ? techRecord.statusCode : STATUS.PROVISIONAL;
  }

  public setCreatedAuditDetails<TechRec extends TechRecord>(techRecord: TechRec, createdByName: string, createdById: string, date: string) {
    techRecord.createdAt = date;
    techRecord.createdByName = createdByName;
    techRecord.createdById = createdById;
    delete techRecord.lastUpdatedAt;
    delete techRecord.lastUpdatedById;
    delete techRecord.lastUpdatedByName;
  }

  public setLastUpdatedAuditDetails<TechRec extends TechRecord>(techRecord: TechRec, createdByName: string, createdById: string, date: string) {
    techRecord.lastUpdatedAt = date;
    techRecord.lastUpdatedByName = createdByName;
    techRecord.lastUpdatedById = createdById;
  }
}

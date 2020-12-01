import {cloneDeep} from "lodash";

import {AuditDetailsHandler} from "../handlers/AuditDetailsHandler";
import { STATUS, UPDATE_TYPE } from "../assets/Enums";
import IMsUserDetails from "../../@Types/IUserDetails";

import records from "../../tests/resources/technical-records.json";


describe("AuditDetailsHandler", () => {
  let auditDetailsHandler: AuditDetailsHandler;
  let currentTechRecord: any;
  let msUserDetails: IMsUserDetails;
  let payload: any;

  beforeAll(() => jest.clearAllMocks());

  beforeEach(() => {
    auditDetailsHandler = new AuditDetailsHandler();
    currentTechRecord = cloneDeep(records[0]);
    payload = {
      createdByName: "createdByName",
      createdById: "createdById",
      date: "date"
    };
    msUserDetails = {
      msUser: "msUser",
      msOid: "msOid"
    };
  });

  afterEach(() => jest.restoreAllMocks());

  it("should exist", () => {
    expect(auditDetailsHandler).toBeTruthy();
  });

  describe("setAuditDetails", () => {
    it(`should update the record updateType to 'techRecordUpdate' with the given arguments`, () => {
      const oldTechRecord = cloneDeep(currentTechRecord);
      auditDetailsHandler.setAuditDetails(currentTechRecord, oldTechRecord, msUserDetails);
      expect(oldTechRecord.updateType).toEqual(UPDATE_TYPE.TECH_RECORD_UPDATE);
    });
  });

  describe("setAuditDetailsAndStatusCodeForNewRecord", () => {
    it("should update the tech record props 'createdByName', 'createdById', 'statusCode' with the given payload", () => {
      auditDetailsHandler.setAuditDetailsAndStatusCodeForNewRecord(currentTechRecord, msUserDetails);
      expect(currentTechRecord.createdByName).toEqual(msUserDetails.msUser);
      expect(currentTechRecord.createdById).toEqual(msUserDetails.msOid);
      expect(currentTechRecord.statusCode).toEqual(STATUS.PROVISIONAL);
    });
  });

  describe("setCreatedAuditDetails", () => {
    it("should update the technical record and its properties with the given payload", () => {
      const {createdByName, createdById, date} = payload;
      const cloneRecord = cloneDeep(currentTechRecord);

      auditDetailsHandler.setCreatedAuditDetails(cloneRecord, createdByName, createdById, date);
      expect(cloneRecord.createdAt).toEqual(date);
      expect(cloneRecord.createdByName).toEqual(createdByName);
      expect(cloneRecord.createdById).toEqual(createdById);
      expect(cloneRecord.lastUpdatedAt).not.toBeTruthy();
      expect(cloneRecord.lastUpdatedById).not.toBeTruthy();
      expect(cloneRecord.lastUpdatedByName).not.toBeTruthy();
    });
  });

  describe("setLastUpdatedAuditDetails", () => {
    it("should update the technical record props 'lastUpdatedByName', 'lastUpdatedById', 'lastUpdatedAt' with the given payload", () => {
      const {createdByName, createdById, date} = payload;

      auditDetailsHandler.setLastUpdatedAuditDetails(currentTechRecord, createdByName, createdById, date);
      expect(currentTechRecord.lastUpdatedByName).toEqual(createdByName);
      expect(currentTechRecord.lastUpdatedById).toEqual(createdById);
      expect(currentTechRecord.lastUpdatedAt).toEqual(date);
    });
  });

});

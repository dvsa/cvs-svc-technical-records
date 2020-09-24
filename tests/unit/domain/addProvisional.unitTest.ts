import { cloneDeep } from "lodash";
import mockData from "../../resources/technical-records.json";
import { STATUS, ERRORS } from "../../../src/assets/Enums";
import IMsUserDetails from "../../../@Types/IUserDetails";
import { HgvProcessor } from "../../../src/domain/Processors";
import { HeavyGoodsVehicle } from "../../../@Types/TechRecords.js";

const msUserDetails: IMsUserDetails = {
  msOid: "1234",
  msUser: "Blabla"
};

describe("addProvisionalTechRecord", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  // FIXME: May need to be re-implemented in VehicleProcessor
  context("a new Provisional tech record is created for a vehicle, that does not have a 'current' tech record", () => {
    it("the following attributes are set on the new provisional tech record: createdByName, createdByID, createdAt and all other tech mockData for this vehicle are unaffected", async () => {
      const techRecord: any = cloneDeep(mockData[43]);
      techRecord.techRecord[0].statusCode = STATUS.ARCHIVED;
      const payload: any = cloneDeep(mockData[43]);

      const MockDAO = jest.fn().mockImplementation(() => {
        return {
          getBySearchTerm: () => {
            return Promise.resolve({
              Items: [cloneDeep(techRecord)],
              Count: 1,
              ScannedCount: 1
            });
          },
          updateSingle: () => {
            return Promise.resolve({
              Attributes: payload
            });
          }
        };
      });
      // const NumberGeneratorMock = jest.fn().mockImplementation();

      expect.assertions(3);
      const hgvVehicle = new HgvProcessor(payload, new MockDAO());
      const updatedTechRec: HeavyGoodsVehicle = await hgvVehicle.addNewProvisionalRecord(msUserDetails);
      expect(updatedTechRec.techRecord[1].statusCode).toEqual(STATUS.PROVISIONAL);
      expect(updatedTechRec.techRecord[1].createdById).toEqual(msUserDetails.msOid);
      expect(updatedTechRec.techRecord[1].createdByName).toEqual(msUserDetails.msUser);
    });
  });

  context(
    "a new Provisional tech record is created for a vehicle, that does not have a 'current' tech record and statusCode of the payload is not 'provisional'",
    () => {
      it("should not allow to save the tech record", async () => {
        const payload: any = cloneDeep(mockData[43]);
        payload.techRecord[0].statusCode = STATUS.CURRENT;
        const MockDAO = jest.fn().mockImplementation();
        expect.assertions(2);
        const hgvVehicle = new HgvProcessor(payload, new MockDAO());

        hgvVehicle.addNewProvisionalRecord(msUserDetails).catch(err => {
          expect(err.statusCode).toEqual(400);
          expect(err.body).toEqual(ERRORS.STATUS_CODE_SHOULD_BE_PROVISIONAL);
        });
      });
    }
  );

  context(
    "a new Provisional tech record is created for a vehicle, that does not have a 'current' tech record and has an existing 'provisional'",
    () => {
      it("should not allow to save the tech record", async () => {
        const techRecord: any = cloneDeep(mockData[43]);
        techRecord.techRecord[0].statusCode = STATUS.PROVISIONAL;
        const payload: any = cloneDeep(mockData[43]);

        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getBySearchTerm: () => {
              return Promise.resolve({
                Items: [cloneDeep(techRecord)],
                Count: 1,
                ScannedCount: 1
              });
            }
          };
        });
        expect.assertions(2);
        const hgvVehicle = new HgvProcessor(payload, new MockDAO());
        hgvVehicle.addNewProvisionalRecord(msUserDetails).catch(err => {
          expect(err.statusCode).toEqual(400);
          expect(err.body).toEqual(ERRORS.CURRENT_OR_PROVISIONAL_RECORD_FOUND);
        });
      });
    }
  );
});

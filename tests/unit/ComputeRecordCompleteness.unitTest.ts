import {cloneDeep} from "lodash";
import mockData from "../resources/technical-records.json";
import {computeRecordCompleteness} from "../../src/utils/record-completeness/ComputeRecordCompleteness";
import HTTPError from "../../src/models/HTTPError";
import {ERRORS, EU_VEHICLE_CATEGORY, RECORD_COMPLETENESS_ENUM} from "../../src/assets/Enums";

describe("Record completeness for systemNumber and Vin", () => {
  let techRecord: any;
  beforeEach(() => {
    techRecord = cloneDeep(mockData[125]);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  context("checking Vin and systemNumber attributes", () => {
    it("should throw an error if systemNumber is not present on the vehicle", () => {
      delete techRecord.systemNumber;
      try {
        expect(computeRecordCompleteness(techRecord)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(400);
        expect(errorResponse.body).toEqual(ERRORS.SYSTEM_NUMBER_GENERATION_FAILED);
      }
    });

    it("should throw an error if vehicleType is not one of [hgv, psv, trl, car, lgv, motorcycle]", () => {
      techRecord.techRecord[0].vehicleType = "something else";
      try {
        expect(computeRecordCompleteness(techRecord)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(400);
        expect(errorResponse.body).toEqual(ERRORS.VEHICLE_TYPE_ERROR);
      }
    });

    it("should return SKELETON if VIN is missing", () => {
      delete techRecord.vin;
      const recordCompleteness = computeRecordCompleteness(techRecord);
      expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
    });
  });
});

describe("Compute Record Completeness", () => {
  let commonMandatoryFields: string[];
  beforeEach(() => {
    commonMandatoryFields = ["noOfAxles", "vehicleType", "statusCode", "reasonForCreation", "createdAt"];
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  context("Checking record completeness for PSV", () => {
    context("checking the core mandatory attributes for PSV", () => {
      it("should return SKELETON if primaryVRM is missing", () => {
        const record: any = cloneDeep(mockData[127]);
        delete record.primaryVrm;
        const recordCompleteness = computeRecordCompleteness(record);
        expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
      });

      it("should return SKELETON if one of the core-mandatory attributes is missing", () => {
        const coreMandatoryFields = commonMandatoryFields.concat(["vehicleConfiguration", "vehicleClass", "vehicleSize", "seatsUpperDeck", "seatsLowerDeck"]);
        for (const coreMandatoryField of coreMandatoryFields) {
          const record: any = cloneDeep(mockData[127]);
          delete (record.techRecord[0] as any)[coreMandatoryField];
          const recordCompleteness = computeRecordCompleteness(record);
          expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
        }
      });
    });

    context("checking the non-core mandatory attributes for PSV", () => {
      it("should return TESTABLE if all core mandatory are completed and one of the non-core mandatory attributes is missing", () => {
        const record: any = cloneDeep(mockData[127]);
        delete record.techRecord[0].fuelPropulsionSystem;
        const recordCompleteness = computeRecordCompleteness(record);
        expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.TESTABLE);
      });
    });

    it("should return COMPLETE if all core mandatory and non-core mandatory attributes are completed", () => {
      const record: any = cloneDeep(mockData[127]);
      const recordCompleteness = computeRecordCompleteness(record);
      expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.COMPLETE);
    });
  });

  context("Checking record completeness for HGV", () => {
    context("checking the core mandatory attributes for HGV", () => {
      it("should return SKELETON if primaryVRM is missing", () => {
        const record: any = cloneDeep(mockData[125]);
        delete record.primaryVrm;
        const recordCompleteness = computeRecordCompleteness(record);
        expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
      });

      it("should return SKELETON if one of the core-mandatory attributes is missing", () => {
        const coreMandatoryFields = commonMandatoryFields.concat(["vehicleConfiguration", "vehicleClass"]);
        for (const coreMandatoryField of coreMandatoryFields) {
          const record: any = cloneDeep(mockData[125]);
          delete (record.techRecord[0] as any)[coreMandatoryField];
          const recordCompleteness = computeRecordCompleteness(record);
          expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
        }
      });
    });

    context("checking the non-core mandatory attributes for HGV", () => {
      it("should return TESTABLE if all core mandatory are completed and one of the non-core mandatory attributes is missing", () => {
        const record: any = cloneDeep(mockData[125]);
        delete record.techRecord[0].brakes.dtpNumber;
        const recordCompleteness = computeRecordCompleteness(record);
        expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.TESTABLE);
      });
    });

    it("should return COMPLETE if all core mandatory and non-core mandatory attributes are completed", () => {
      const record: any = cloneDeep(mockData[125]);
      const recordCompleteness = computeRecordCompleteness(record);
      expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.COMPLETE);
    });
  });

  context("Checking record completeness for TRL", () => {
    context("checking the core mandatory attributes for TRL", () => {
      it("should return SKELETON if trailerID is missing", () => {
        const record: any = cloneDeep(mockData[126]);
        delete record.trailerId;
        const recordCompleteness = computeRecordCompleteness(record);
        expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
      });

      it("should return SKELETON if one of the core-mandatory attributes is missing", () => {
        const coreMandatoryFields = commonMandatoryFields.concat(["vehicleConfiguration", "vehicleClass"]);
        for (const coreMandatoryField of coreMandatoryFields) {
          const record: any = cloneDeep(mockData[126]);
          delete (record.techRecord[0] as any)[coreMandatoryField];
          const recordCompleteness = computeRecordCompleteness(record);
          expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
        }
      });
    });

    context("checking the non-core mandatory attributes for TRL", () => {
      it("should return TESTABLE if all core mandatory are completed and one of the non-core mandatory attributes is missing", () => {
        const record: any = cloneDeep(mockData[126]);
        delete record.techRecord[0].dimensions.length;
        record.techRecord[0].euVehicleCategory = EU_VEHICLE_CATEGORY.O2;
        const recordCompleteness = computeRecordCompleteness(record);
        expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.TESTABLE);
      });

      it("should return COMPLETE if all core mandatory are completed and primaryVrm is missing", () => {
        const record: any = cloneDeep(mockData[126]);
        delete record.primaryVrm;
        const recordCompleteness = computeRecordCompleteness(record);
        expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.COMPLETE);
      });
    });

    it("should return COMPLETE if all core mandatory and non-core mandatory attributes are completed", () => {
      const record: any = cloneDeep(mockData[126]);
      const recordCompleteness = computeRecordCompleteness(record);
      expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.COMPLETE);
    });
  });

  context("Checking record completeness for LGV", () => {
    context("checking the core mandatory attributes for LGV", () => {
      it("should return SKELETON if one of the core-mandatory attributes is missing", () => {
        for (const coreMandatoryField of commonMandatoryFields) {
          const record: any = cloneDeep(mockData[124]);
          delete (record.techRecord[0] as any)[coreMandatoryField];
          const recordCompleteness = computeRecordCompleteness(record);
          expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
        }
      });
    });

    it("should return COMPLETE if all core mandatory attributes are completed and there are no non-core attributes applicable", () => {
      const record: any = cloneDeep(mockData[124]);
      const recordCompleteness = computeRecordCompleteness(record);
      expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.COMPLETE);
    });
  });

  context("Checking record completeness for CAR", () => {
    context("checking the core mandatory attributes for CAR", () => {
      it("should return SKELETON if one of the core-mandatory attributes is missing", () => {
        for (const coreMandatoryField of commonMandatoryFields) {
          const record: any = cloneDeep(mockData[123]);
          delete (record.techRecord[0] as any)[coreMandatoryField];
          const recordCompleteness = computeRecordCompleteness(record);
          expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
        }
      });
    });

    it("should return COMPLETE if all core mandatory attributes are completed and there are no non-core attributes applicable", () => {
      const record: any = cloneDeep(mockData[123]);
      const recordCompleteness = computeRecordCompleteness(record);
      expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.COMPLETE);
    });
  });

  context("Checking record completeness for MOTORCYCLE", () => {
    context("checking the core mandatory attributes for MOTORCYCLE", () => {
      it("should return SKELETON if one of the core-mandatory attributes is missing", () => {
        for (const coreMandatoryField of commonMandatoryFields) {
          const record: any = cloneDeep(mockData[122]);
          delete (record.techRecord[0] as any)[coreMandatoryField];
          const recordCompleteness = computeRecordCompleteness(record);
          expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
        }
      });
    });

    it("should return COMPLETE if all core mandatory attributes are completed and there are no non-core attributes applicable", () => {
      const record: any = cloneDeep(mockData[122]);
      const recordCompleteness = computeRecordCompleteness(record);
      expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.COMPLETE);
    });
  });

  context("one core mandatory field is missing and one non-core mandatory field is missing", () => {
    it("should return SKELETON", () => {
      const record: any = cloneDeep(mockData[127]);
      delete record.techRecord[0].noOfAxles;
      delete record.techRecord[0].numberOfSeatbelts;
      const recordCompleteness = computeRecordCompleteness(record);
      expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
    });
  });

  context("one core mandatory field is missing and all non-core mandatory are completed", () => {
    it("should return SKELETON", () => {
      const record: any = cloneDeep(mockData[127]);
      delete record.techRecord[0].noOfAxles;
      const recordCompleteness = computeRecordCompleteness(record);
      expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
    });
  });

  context("hiddenInVta flag is set to true", () => {
    it("should return SKELETON", () => {
      const record: any = cloneDeep(mockData[127]);
      record.techRecord[0].hiddenInVta = true;
      const recordCompleteness = computeRecordCompleteness(record);
      expect(recordCompleteness).toEqual(RECORD_COMPLETENESS_ENUM.SKELETON);
    });
  });
});

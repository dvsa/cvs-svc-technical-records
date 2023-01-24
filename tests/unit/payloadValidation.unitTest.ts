import {cloneDeep} from "lodash";
import mockData from "../resources/technical-records.json";
import ITechRecord from "../../@Types/ITechRecord";
import {BODY_TYPE_DESCRIPTION, VEHICLE_CLASS_DESCRIPTION, ERRORS} from "../../src/assets/Enums";
import HTTPError from "../../src/models/HTTPError";
import Configuration from "../../src/utils/Configuration";
import * as fromValidation from "../../src/utils/validations";

const createPayload = () => {
  const techRec: any = cloneDeep(mockData[74]);
  techRec.techRecord[0].reasonForCreation = "some reason for update";
  return techRec.techRecord[0];
};

describe("New vehicle classes creation", () => {
  beforeAll(() => {
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(false);
  });
  afterAll(() => {
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(true);
  });
  context("When validating a vehicle", () => {
    context("and the payload is valid", () => {
      it("should autopopulate the vehicle class code", () => {
        const payload: ITechRecord = createPayload();
        for (const vehicleClass of VEHICLE_CLASS_DESCRIPTION) {
          payload.vehicleClass.description = vehicleClass;
          fromValidation.populateFields(payload);
          expect(payload.vehicleClass.code).toEqual(fromValidation.vehicleClassCodeMap.get(vehicleClass));
        }
      });

      it("should not populate vehicle class code if vehicleClass is missing (LGV, CAR, MOTORCYCLE)", () => {
        const payload: ITechRecord = createPayload();
        delete payload.vehicleClass;
        fromValidation.populateFields(payload);
        expect(payload).not.toHaveProperty("vehicleClass");
      });

      it("should autopopulate the body type code", () => {
        const payload: ITechRecord = createPayload();
        for (const bodyType of BODY_TYPE_DESCRIPTION) {
          payload.bodyType.description = bodyType;
          fromValidation.populateFields(payload);
          expect(payload.bodyType.code).toEqual(fromValidation.bodyTypeCodeMap.get(bodyType));
        }
      });

      it("should autopopulate the brake code fields", () => {
        const payload: ITechRecord = createPayload();
        payload.brakes.brakeCode = "123456";
        fromValidation.populateFields(payload);
        expect(payload.brakes.brakeCodeOriginal).toEqual("456");
        expect(payload.brakeCode).toEqual("123456");
      });
    });

    context("and the payload is invalid", () => {
      it("should throw Error: Not valid if vehicle class description is not an accepted field", () => {
        try {
          expect(fromValidation.populateVehicleClassCode("whatever")).toThrowError();
        } catch (errorResponse) {
          console.log(errorResponse);
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.body.errors).toContain(ERRORS.INVALID_VEHICLE_CLASS);
        }
      });

      it("should throw Error: Not valid if body type description is not an accepted field", () => {
        try {
          expect(fromValidation.populateBodyTypeCode("whatever")).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.body.errors).toContain(ERRORS.INVALID_BODY_TYPE);
        }
      });
    });
  });
});

describe("payload validation for adr feature flag", () => {
  const hgvTrlOptions = {abortEarly: false, context: {isTankOrBattery: true}};
  context("when the allowAdrUpdatesOnlyFlag config variable is set to TRUE", () => {
    it("should validate only the adrDetails and reason for creation for TRL", () => {
      const techRec: any = cloneDeep(mockData[29]);
      const validatedPayload = fromValidation.featureFlagValidation(fromValidation.trlValidation, techRec.techRecord[0], false, hgvTrlOptions);
      expect(validatedPayload.value).toBeDefined();
      expect(validatedPayload.error).toEqual(undefined);
      expect(validatedPayload.value.reasonForCreation).toEqual(techRec.techRecord[0].reasonForCreation);
      expect(validatedPayload.value.adrDetails).toEqual(techRec.techRecord[0].adrDetails);
    });

    it("should validate only the adrDetails and reason for creation for HGV", () => {
      const techRec: any = cloneDeep(mockData[43]);
      const validatedPayload = fromValidation.featureFlagValidation(fromValidation.hgvValidation, techRec.techRecord[0], false, hgvTrlOptions);
      expect(validatedPayload.value).toBeDefined();
      expect(validatedPayload.error).toEqual(undefined);
      expect(validatedPayload.value.reasonForCreation).toEqual(techRec.techRecord[0].reasonForCreation);
      expect(validatedPayload.value.adrDetails).toEqual(techRec.techRecord[0].adrDetails);
    });
  });
});

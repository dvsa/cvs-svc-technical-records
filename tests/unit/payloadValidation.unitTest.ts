import {cloneDeep} from "lodash";
import mockData from "../resources/technical-records.json";
import ITechRecord from "../../@Types/ITechRecord";
import * as fromValidation from "../../src/utils/validations";
import {
  VEHICLE_TYPE,
  BODY_TYPE_DESCRIPTION,
  VEHICLE_CLASS_DESCRIPTION
} from "../../src/assets/Enums";
import Configuration from "../../src/utils/Configuration";

const createPayload = () => {
  const techRec: any = cloneDeep(mockData[74]);
  techRec.techRecord[0].reasonForCreation = "some reason for update";
  return techRec.techRecord[0];
};

const vehicleClassMap: any = {
  "motorbikes over 200cc or with a sidecar": "2",
  "not applicable": "n",
  "small psv (ie: less than or equal to 22 seats)": "s",
  "motorbikes up to 200cc": "1",
  "trailer": "t",
  "large psv(ie: greater than 23 seats)": "l",
  "3 wheelers": "3",
  "heavy goods vehicle": "v",
  "MOT class 4": "4",
  "MOT class 7": "7",
  "MOT class 5": "5"
};

const bodyTypeMap: any = {
  "articulated": "a",
  "single decker": "s",
  "double decker": "d",
  "other": "o",
  "petrol/oil tanker": "p",
  "skeletal": "k",
  "tipper": "t",
  "box": "b",
  "flat": "f",
  "refuse": "r",
  "skip loader": "s",
  "refrigerated": "c"
};

describe("payloadValidation", () => {
  beforeAll(() => {
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(false);
  });
  afterAll(() => {
    Configuration.getInstance().setAllowAdrUpdatesOnlyFlag(true);
  });
  context("When validating the payload", () => {
    context("and the payload is valid", () => {

      it("should pass the validation and return the validated payload for TRL", () => {
        const techRec: any = cloneDeep(mockData[78]);
        delete techRec.techRecord[0].statusCode;
        const validatedPayload = fromValidation.validatePayload(techRec.techRecord[0]);
        expect(validatedPayload.value).toBeDefined();
        expect(validatedPayload.error).toEqual(undefined);
        expect(validatedPayload.value.vehicleType).toEqual(VEHICLE_TYPE.TRL);
      });

      it("should pass the validation and return the validated payload for PSV", () => {
        const techRec: any = cloneDeep(mockData[74]);
        delete techRec.techRecord[0].statusCode;
        const validatedPayload = fromValidation.validatePayload(techRec.techRecord[0]);
        expect(validatedPayload.value).toBeDefined();
        expect(validatedPayload.error).toEqual(undefined);
        expect(validatedPayload.value.vehicleType).toEqual(VEHICLE_TYPE.PSV);
      });

      it("should pass the validation and return the validated payload for HGV", () => {
        const techRec: any = cloneDeep(mockData[43]);
        delete techRec.techRecord[0].statusCode;
        const validatedPayload = fromValidation.validatePayload(techRec.techRecord[0]);
        expect(validatedPayload.value).toBeDefined();
        expect(validatedPayload.error).toEqual(undefined);
        expect(validatedPayload.value.vehicleType).toEqual(VEHICLE_TYPE.HGV);
      });

      it("should pass the validation and return the validated payload for LGV", () => {
        const techRec: any = cloneDeep(mockData[124]);
        delete techRec.techRecord[0].statusCode;
        const validatedPayload = fromValidation.validatePayload(techRec.techRecord[0]);
        expect(validatedPayload.value).toBeDefined();
        expect(validatedPayload.error).toEqual(undefined);
        expect(validatedPayload.value.vehicleType).toEqual(VEHICLE_TYPE.LGV);
      });

      it("should pass the validation and return the validated payload for CAR", () => {
        const techRec: any = cloneDeep(mockData[123]);
        delete techRec.techRecord[0].statusCode;
        const validatedPayload = fromValidation.validatePayload(techRec.techRecord[0]);
        expect(validatedPayload.value).toBeDefined();
        expect(validatedPayload.error).toEqual(undefined);
        expect(validatedPayload.value.vehicleType).toEqual(VEHICLE_TYPE.CAR);
      });

      it("should pass the validation and return the validated payload for MOTORCYCLE", () => {
        const techRec: any = cloneDeep(mockData[122]);
        delete techRec.techRecord[0].statusCode;
        const validatedPayload = fromValidation.validatePayload(techRec.techRecord[0]);
        expect(validatedPayload.value).toBeDefined();
        expect(validatedPayload.error).toEqual(undefined);
        expect(validatedPayload.value.vehicleType).toEqual(VEHICLE_TYPE.MOTORCYCLE);
      });

      it("should autopopulate the vehicle class code", () => {
        const payload: ITechRecord = createPayload();
        for (const vehicleClass of VEHICLE_CLASS_DESCRIPTION) {
          payload.vehicleClass.description = vehicleClass;
          fromValidation.populateFields(payload);
          expect(payload.vehicleClass.code).toEqual(vehicleClassMap[vehicleClass]);
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
          expect(payload.bodyType.code).toEqual(bodyTypeMap[bodyType]);
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
          expect(errorResponse).toBeInstanceOf(Error);
          expect(errorResponse.message).toEqual("Not valid");
        }
      });

      it("should throw Error: Not valid if body type description is not an accepted field", () => {
        try {
          expect(fromValidation.populateBodyTypeCode("whatever")).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(Error);
          expect(errorResponse.message).toEqual("Not valid");
        }
      });
    });
  });
});

describe("payload validation for adr feature flag", () => {
  context("when the allowAdrUpdatesOnlyFlag config variable is set to TRUE", () => {
    it("should validate only the adrDetails and reason for creation for TRL", () => {
      const techRec: any = cloneDeep(mockData[29]);
      const validatedPayload = fromValidation.validatePayload(techRec.techRecord[0], false);
      expect(validatedPayload.value).toBeDefined();
      expect(validatedPayload.error).toEqual(undefined);
      expect(validatedPayload.value.reasonForCreation).toEqual(techRec.techRecord[0].reasonForCreation);
      expect(validatedPayload.value.adrDetails).toEqual(techRec.techRecord[0].adrDetails);
    });

    it("should validate only the adrDetails and reason for creation for HGV", () => {
      const techRec: any = cloneDeep(mockData[43]);
      const validatedPayload = fromValidation.validatePayload(techRec.techRecord[0], false);
      expect(validatedPayload.value).toBeDefined();
      expect(validatedPayload.error).toEqual(undefined);
      expect(validatedPayload.value.reasonForCreation).toEqual(techRec.techRecord[0].reasonForCreation);
      expect(validatedPayload.value.adrDetails).toEqual(techRec.techRecord[0].adrDetails);
    });
  });
});

import {cloneDeep} from "lodash";
import mockData from "../resources/technical-records.json";
import {
  bodyTypeDescription,
  vehicleClassDescription,
  populateBodyTypeCode,
  populateVehicleClassCode, populateFields
} from "../../src/utils/ValidationEnums";
import ITechRecord from "../../@Types/ITechRecord";

const createPayload = () => {
  const techRec: any = cloneDeep(mockData[43]);
  techRec.techRecord[0].reasonForCreation = "some reason for update";
  delete techRec.techRecord[0].statusCode;
  delete techRec.techRecord[0].createdByName;
  delete techRec.techRecord[0].createdAt;
  delete techRec.techRecord[0].createdById;
  delete techRec.techRecord[0].vehicleClass.code;
  delete techRec.techRecord[0].bodyType.code;
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
  context("When validating the payload", () => {
    context("and the payload is valid", () => {

      it("should autopopulate the vehicle class code", () => {
        const payload: ITechRecord = createPayload();
        for (const vehicleClass of vehicleClassDescription) {
          payload.vehicleClass.description = vehicleClass;
          populateFields(payload);
          expect(payload.vehicleClass.code).toEqual(vehicleClassMap[vehicleClass]);
        }
      });

      it("should autopopulate the body type code", () => {
        const payload: ITechRecord = createPayload();
        for (const bodyType of bodyTypeDescription) {
          payload.bodyType.description = bodyType;
          populateFields(payload);
          expect(payload.bodyType.code).toEqual(bodyTypeMap[bodyType]);
        }
      });
    });

    context("and the payload is invalid", () => {
      it("should throw Error: Not valid if vehicle class description is not an accepted field", () => {
        try {
          expect(populateVehicleClassCode("whatever")).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(Error);
          expect(errorResponse.message).toEqual("Not valid");
        }
      });

      it("should throw Error: Not valid if body type description is not an accepted field", () => {
        try {
          expect(populateBodyTypeCode( "whatever")).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(Error);
          expect(errorResponse.message).toEqual("Not valid");
        }
      });
    });
  });
});

import ITechRecord from "../../../@Types/ITechRecord";
import { VEHICLE_TYPE, ERRORS } from "../../assets/Enums";
import { ValidationError, ValidationResult } from "@hapi/joi";
import { ErrorHandler } from "../../handlers/ErrorHandler";

export const populateVehicleClassCode = (description: string) => {
  switch (description) {
    case "motorbikes over 200cc or with a sidecar":
      return "2";
    case "not applicable":
      return "n";
    case "small psv (ie: less than or equal to 22 seats)":
      return "s";
    case "motorbikes up to 200cc":
      return "1";
    case "trailer":
      return "t";
    case "large psv(ie: greater than 23 seats)":
      return "l";
    case "3 wheelers":
      return "3";
    case "heavy goods vehicle":
      return "v";
    case "MOT class 4":
      return "4";
    case "MOT class 7":
      return "7";
    case "MOT class 5":
      return "5";
    default:
     throw ErrorHandler.Error(400, ERRORS.INVALID_VEHICLE_CLASS);
  }
};

export const populateBodyTypeCode = (description: string) => {
  switch (description) {
    case "articulated":
      return "a";
    case "single decker":
      return "s";
    case "double decker":
      return "d";
    case "other":
      return "o";
    case "petrol/oil tanker":
      return "p";
    case "skeletal":
      return "k";
    case "tipper":
      return "t";
    case "box":
      return "b";
    case "flat":
      return "f";
    case "refuse":
      return "r";
    case "skip loader":
      return "s";
    case "refrigerated":
      return "c";
    default:
      throw ErrorHandler.Error(400, ERRORS.INVALID_BODY_TYPE);
  }
};

export const populatePartialVin = (vin: string) => (vin.length<6) ? vin : vin.substr(vin.length - 6);

export const populateFields = (techRecord: ITechRecord) => {
  const { vehicleType } = techRecord;
  if (
    vehicleType === VEHICLE_TYPE.PSV ||
    vehicleType === VEHICLE_TYPE.HGV ||
    vehicleType === VEHICLE_TYPE.TRL
  ) {
    techRecord.bodyType.code = populateBodyTypeCode(
      techRecord.bodyType.description
    );
  }
  if (techRecord.vehicleClass) {
    techRecord.vehicleClass.code = populateVehicleClassCode(
      techRecord.vehicleClass.description
    );
  }
  if (techRecord.vehicleType === VEHICLE_TYPE.PSV) {
    techRecord.brakes.brakeCodeOriginal = techRecord.brakes.brakeCode.substring(
      techRecord.brakes.brakeCode.length - 3
    );
    techRecord.brakeCode = techRecord.brakes.brakeCode;
  }
};

/**
 * To handle the result to be validated and return an array of error strings
 * @param validationResult the result to be validated
 */
export const handleValidationResult = (validationResult: ValidationResult) => validationResult.error? mapValidationErrors(validationResult.error): [];

/**
 * To map error messages from ValidationError object into a string array 
 * @param validationError List of validation errors
 */
export const mapValidationErrors = (validationError: ValidationError) =>
  validationError.details.map((detail: { message: string }) => detail.message);

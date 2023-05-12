import ITechRecord from "../../../@Types/ITechRecord";
import { VEHICLE_TYPE, ERRORS } from "../../assets/Enums";
import { ValidationError, ValidationResult } from "@hapi/joi";
import { ErrorHandler } from "../../handlers/ErrorHandler";

export const populateVehicleClassCode = (description: string): string => {
  const classCode = vehicleClassCodeMap.get(description);

  if (!classCode) throw ErrorHandler.Error(400, ERRORS.INVALID_VEHICLE_CLASS);

  return classCode;
};

export const vehicleClassCodeMap = new Map<string, string>([
  ["3 wheelers",                                     "3"],
  ["heavy goods vehicle",                            "v"],
  ["large psv(ie: greater than 23 seats)",           "l"],
  ["MOT class 4",                                    "4"],
  ["MOT class 5",                                    "5"],
  ["MOT class 7",                                    "7"],
  ["motorbikes over 200cc or with a sidecar",        "2"],
  ["motorbikes up to 200cc",                         "1"],
  ["not applicable",                                 "n"],
  ["small psv (ie: less than or equal to 22 seats)", "s"],
  ["trailer",                                        "t"]
]);

export const populateBodyTypeCode = (description: string): string => {
  const bodyTypeCode = bodyTypeCodeMap.get(description);

  if (!bodyTypeCode) throw ErrorHandler.Error(400, ERRORS.INVALID_BODY_TYPE);

  return bodyTypeCode;
}

export const bodyTypeCodeMap = new Map<string, string>([
  ["artic",             "u"],
  ["articulated",       "a"],
  ["box",               "b"],
  ["car transporter",   "y"],
  ["concrete mixer",    "m"],
  ["curtainsider",      "e"],
  ["double decker",     "d"],
  ["flat",              "f"],
  ["livestock carrier", "i"],
  ["low loader",        "l"],
  ["mini bus",          "m"],
  ["other",             "x"],
  ["other tanker",      "o"],
  ["petrol/oil tanker", "p"],
  ["refrigerated",      "c"],
  ["refuse",            "r"],
  ["single decker",     "s"],
  ["skeletal",          "k"],
  ["skip loader",       "s"],
  ["tipper",            "t"],
  ["tractor",           "a"]
]);

export const populatePartialVin = (vin: string): string => vin.length < 6 ? vin : vin.substring(vin.length - 6);

export const populateFields = (techRecord: ITechRecord): void => {
  const { vehicleType } = techRecord;
  
  if (vehicleType === VEHICLE_TYPE.PSV || vehicleType === VEHICLE_TYPE.HGV || vehicleType === VEHICLE_TYPE.TRL) {
    techRecord.bodyType.code = populateBodyTypeCode(techRecord.bodyType.description);
  }

  if (techRecord.vehicleClass) {
    techRecord.vehicleClass.code = populateVehicleClassCode(techRecord.vehicleClass.description);
  }

  if (vehicleType === VEHICLE_TYPE.PSV) {
    techRecord.brakes.brakeCodeOriginal = techRecord.brakes.brakeCode.substring(techRecord.brakes.brakeCode.length - 3);
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

import HTTPError from "../../models/HTTPError";
import {ERRORS, RECORD_COMPLETENESS_ENUM, VEHICLE_TYPE} from "../../assets/Enums";
import * as coreMandatoryValidation from "./CoreMandatoryValidations";
import {ObjectSchema} from "@hapi/joi";
import * as nonCoreMandatoryValidation from "./NonCoreMandatoryValidations";
import { Vehicle, Trailer } from "../../../@Types/TechRecords";

const validateRecordCompleteness = (validationSchema: ObjectSchema | undefined, techRecordFields: any) => {
  if (validationSchema) {
    return validationSchema.validate(techRecordFields, {stripUnknown: true});
  } else {
    return undefined;
  }
};

const validateVehicleAttributes = (vehicleType: string, vehicleAttributes: any) => {
  if (vehicleType !== VEHICLE_TYPE.TRL) {
    return validateRecordCompleteness(coreMandatoryValidation.psvHgvCarLgvMotoCoreMandatoryVehicleAttributes, vehicleAttributes);
  } else {
    return validateRecordCompleteness(coreMandatoryValidation.trlCoreMandatoryVehicleAttributes, vehicleAttributes);
  }
};

const validateCoreAndNonCoreMandatoryTechRecordAttributes = (vehicleType: string, techRecordWrapper: Vehicle) => {
  let coreMandatoryValidationResult;
  let nonCoreMandatoryValidationResult;
  let coreMandatorySchema: ObjectSchema;
  let nonCoreMandatorySchema: ObjectSchema | undefined;
  let techRecord = techRecordWrapper.techRecord[0];
  if (vehicleType === VEHICLE_TYPE.HGV) {
    coreMandatorySchema = coreMandatoryValidation.hgvCoreMandatorySchema;
    nonCoreMandatorySchema = nonCoreMandatoryValidation.hgvNonCoreMandatorySchema;
  } else if (vehicleType === VEHICLE_TYPE.PSV) {
    coreMandatorySchema = coreMandatoryValidation.psvCoreMandatorySchema;
    nonCoreMandatorySchema = nonCoreMandatoryValidation.psvNonCoreMandatorySchema;
  } else if (vehicleType === VEHICLE_TYPE.TRL) {
    techRecord = {...techRecord, primaryVrm: techRecordWrapper.primaryVrm} as any;
    coreMandatorySchema = coreMandatoryValidation.trlCoreMandatorySchema;
    nonCoreMandatorySchema = nonCoreMandatoryValidation.trlNonCoreMandatorySchema;
  } else if (vehicleType === VEHICLE_TYPE.LGV) {
    coreMandatorySchema = coreMandatoryValidation.lgvCoreMandatorySchema;
  } else if (vehicleType === VEHICLE_TYPE.CAR) {
    coreMandatorySchema = coreMandatoryValidation.carCoreMandatorySchema;
  } else if (vehicleType === VEHICLE_TYPE.MOTORCYCLE) {
    coreMandatorySchema = coreMandatoryValidation.motorcycleCoreMandatorySchema;
  } else {
    throw new HTTPError(400, ERRORS.VEHICLE_TYPE_ERROR);
  }
  coreMandatoryValidationResult = validateRecordCompleteness(coreMandatorySchema, techRecord);
  nonCoreMandatoryValidationResult = validateRecordCompleteness(nonCoreMandatorySchema, techRecord);
  return {coreMandatoryValidationResult, nonCoreMandatoryValidationResult};
};

export const computeRecordCompleteness = (techRecordWrapper: Vehicle, trailerId?: string): string => {
  let recordCompleteness = RECORD_COMPLETENESS_ENUM.COMPLETE;
  let isCoreMandatoryValid = true;
  let isNonCoreMandatoryValid = true;
  if (!techRecordWrapper.systemNumber) {
    throw new HTTPError(400, ERRORS.SYSTEM_NUMBER_GENERATION_FAILED);
  }
  const generalAttributes = {
    systemNumber: techRecordWrapper.systemNumber,
    vin: techRecordWrapper.vin,
    primaryVrm: techRecordWrapper.primaryVrm,
    // FIXME: handle trailerId in a better way
    trailerId
  };
  const vehicleType = techRecordWrapper.techRecord[0].vehicleType;
  if (!vehicleType) {
    return RECORD_COMPLETENESS_ENUM.SKELETON;
  }
  const generalErrors = validateVehicleAttributes(vehicleType, generalAttributes)?.error;

  if (generalErrors) {
    console.log("general errors: ",generalErrors);
    return RECORD_COMPLETENESS_ENUM.SKELETON;
  }

  const mandatoryAttributesValidationResult = validateCoreAndNonCoreMandatoryTechRecordAttributes(vehicleType, techRecordWrapper);
  const mandatoryErrors = mandatoryAttributesValidationResult.coreMandatoryValidationResult?.error;
  isCoreMandatoryValid = !mandatoryErrors;
  isNonCoreMandatoryValid = !mandatoryAttributesValidationResult.nonCoreMandatoryValidationResult?.error;

  if (!isCoreMandatoryValid) {
    recordCompleteness = RECORD_COMPLETENESS_ENUM.SKELETON;
  } else if (isCoreMandatoryValid && !isNonCoreMandatoryValid) {
    recordCompleteness = RECORD_COMPLETENESS_ENUM.TESTABLE;
  } else {
    recordCompleteness = RECORD_COMPLETENESS_ENUM.COMPLETE;
  }
  return recordCompleteness;
};

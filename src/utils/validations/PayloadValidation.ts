import {ERRORS, SEARCHCRITERIA, VEHICLE_TYPE} from "../../assets/Enums";
import Joi, {ObjectSchema} from "@hapi/joi";
import Configuration from "../Configuration";
import * as fromValidation from "./";
import { HgvTechRecord, Vehicle, TechRecord, TrlTechRecord } from "../../../@Types/TechRecords";
import { hgvValidation } from "./HgvValidations";
import { trlValidation } from "./TrlValidations";
import { handleValidationResult } from "./ValidationUtils";

export const checkIfTankOrBattery = (payload: HgvTechRecord | TrlTechRecord) => {
  let isTankOrBattery = false;
  if (payload.adrDetails && payload.adrDetails.vehicleDetails && payload.adrDetails.vehicleDetails.type) {
    const vehicleDetailsType = payload.adrDetails.vehicleDetails.type.toLowerCase();
    if ((vehicleDetailsType.indexOf("battery") !== -1) || (vehicleDetailsType.indexOf("tank") !== -1)) {
      isTankOrBattery = true;
    }
  }
  return isTankOrBattery;
};

export const featureFlagValidation = (validationSchema: ObjectSchema, payload: HgvTechRecord | TrlTechRecord, validateEntireRecord: boolean, options: any) => {
  const allowAdrUpdatesOnlyFlag: boolean = Configuration.getInstance().getAllowAdrUpdatesOnlyFlag();
  if (allowAdrUpdatesOnlyFlag && !validateEntireRecord) {
    Object.assign(options, {stripUnknown: true});
    const {adrDetails, reasonForCreation} = payload;
    return fromValidation.validateOnlyAdr.validate({adrDetails, reasonForCreation}, options);
  } else {
    return validationSchema.validate(payload, options);
  }
};

/**
 * common validation function for both HGVs and Trailers.
 * @param payload payload which needs to be validated
 * @param options validation configurations
 * @param isCreate true for create request and false for update request
 */
export const validateHGVOrTrailer =(payload: HgvTechRecord | TrlTechRecord, options: any , isCreate: boolean) => {
  const isTankOrBattery: boolean = checkIfTankOrBattery(payload);
  options = {...options, context: {isTankOrBattery}};
  const validationSchema = payload.vehicleType === VEHICLE_TYPE.HGV? hgvValidation:trlValidation;
  const validationResult = featureFlagValidation(validationSchema, payload, isCreate, options);
  return handleValidationResult(validationResult);
};

export const validatePrimaryVrm = Joi.string().min(1).max(9);
export const validateSecondaryVrms = Joi.array().items(Joi.string().min(1).max(9));
export const validateTrailerId = Joi.string().min(7).max(8);

export const primaryVrmValidator = (primaryVrm?: string, isRequired: boolean = true) => {
  const errors: string[] = [];
  if(isRequired && !primaryVrm) {
    errors.push(ERRORS.INVALID_PRIMARY_VRM);
    return errors;
  }
  const validationResult = validatePrimaryVrm.validate(primaryVrm);
  if(validationResult.error) {
    errors.push(ERRORS.INVALID_PRIMARY_VRM);
  }
  return errors;
};

export const secondaryVrmValidator = (secondayVrms?: string[]) => {
  const errors: string[] = [];
  const validationResult = validateSecondaryVrms.validate(secondayVrms);
  if(validationResult.error) {
    errors.push(ERRORS.INVALID_SECONDARY_VRM);
  }
  return errors;
 };


export const isValidSearchCriteria = (specifiedCriteria: string): boolean => {
  const vals: string[] = Object.values(SEARCHCRITERIA);
  // return vals.includes(specifiedCriteria); //TODO reinstate for proper input validation
  return true;
};

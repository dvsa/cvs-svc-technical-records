import {hgvValidation} from "./HgvValidations";
import ITechRecord from "../../@Types/ITechRecord";
import {VEHICLE_TYPE, SEARCHCRITERIA} from "../assets/Enums";
import Joi, {ObjectSchema} from "@hapi/joi";
import {psvValidation} from "./PsvValidations";
import {trlValidation} from "./TrlValidations";
import {validateOnlyAdr} from "./AdrValidation";
import Configuration from "./Configuration";

const checkIfTankOrBattery = (payload: ITechRecord) => {
  let isTankOrBattery = false;
  if (payload.adrDetails && payload.adrDetails.vehicleDetails && payload.adrDetails.vehicleDetails.type) {
    const vehicleDetailsType = payload.adrDetails.vehicleDetails.type.toLowerCase();
    if ((vehicleDetailsType.indexOf("battery") !== -1) || (vehicleDetailsType.indexOf("tank") !== -1)) {
      isTankOrBattery = true;
    }
  }
  return isTankOrBattery;
};

const featureFlagValidation = (validationSchema: ObjectSchema, payload: ITechRecord, validateEntireRecord: boolean, options: any) => {
  const allowAdrUpdatesOnlyFlag: boolean = Configuration.getInstance().getAllowAdrUpdatesOnlyFlag();
  if (allowAdrUpdatesOnlyFlag && !validateEntireRecord) {
    Object.assign(options, {stripUnknown: true});
    const {adrDetails, reasonForCreation} = payload;
    return validateOnlyAdr.validate({adrDetails, reasonForCreation}, options);
  } else {
    return validationSchema.validate(payload, options);
  }
};

export const validatePayload = (payload: ITechRecord, validateEntireRecord: boolean = true) => {
  const isTankOrBattery = checkIfTankOrBattery(payload);
  const options = {abortEarly: false, context: {isTankOrBattery}};
  if (payload.vehicleType === VEHICLE_TYPE.HGV) {
    return featureFlagValidation(hgvValidation, payload, validateEntireRecord, options);
  } else if (payload.vehicleType === VEHICLE_TYPE.PSV) {
    return psvValidation.validate(payload, {abortEarly: false});
  } else if (payload.vehicleType === VEHICLE_TYPE.TRL) {
    return featureFlagValidation(trlValidation, payload, validateEntireRecord, options);
  } else {
    return {
      error: {
        details: [{message: "\"vehicleType\" must be one of [hgv, psv, trl]"}]
      }
    };
  }
};

export const validatePrimaryVrm = Joi.string().min(1).max(9);
export const validateSecondaryVrms = Joi.array().items(Joi.string().min(1).max(9));
export const validateTrailerId = Joi.string().min(7).max(8);


export const isValidSearchCriteria = (specifiedCriteria: string): boolean => {
  const vals: string[] = Object.values(SEARCHCRITERIA);
  // return vals.includes(specifiedCriteria); //TODO reinstate for proper input validation
  return true;
};

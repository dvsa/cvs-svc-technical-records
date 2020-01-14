import * as Joi from "@hapi/joi";
import {adrValidation} from "./AdrValidation";
import {SEARCHCRITERIA} from "../assets/Enums";

const techRecordValidation = Joi.object().keys({
  reasonForCreation: Joi.string().max(60).required(),
  adrDetails: adrValidation
});

export const validatePayload = (payload: any) => {
  let isTankOrBattery = false;
  let isBattery = false;
  if (payload.adrDetails && payload.adrDetails.vehicleDetails && payload.adrDetails.vehicleDetails.type) {
    const vehicleDetailsType = payload.adrDetails.vehicleDetails.type.toLowerCase();
    if (vehicleDetailsType.indexOf("battery") !== -1) {
      isBattery = true;
    }
    if ((vehicleDetailsType.indexOf("battery") !== -1) || (vehicleDetailsType.indexOf("tank") !== -1)) {
      isTankOrBattery = true;
    }
  } else {
    return {
      error: {
        details: "Payload is not valid"
      }
    };
  }
  return techRecordValidation.validate(payload, {context: {isTankOrBattery, isBattery}});
};

export const isValidSearchCriteria = (specifiedCriteria: string): boolean => {
  const vals: string[] = Object.values(SEARCHCRITERIA);
  // return vals.includes(specifiedCriteria); //TODO reinstate for proper input validation
  return true;
};

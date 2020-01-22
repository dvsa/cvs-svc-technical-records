import * as Joi from "@hapi/joi";
import {adrValidation} from "./AdrValidation";

const techRecordValidation = Joi.object().keys({
  reasonForCreation: Joi.string().max(60).required(),
  adrDetails: adrValidation
});

export const validatePayload = (payload: any) => {
  let isTankOrBattery = false;
  if (payload.adrDetails && payload.adrDetails.vehicleDetails && payload.adrDetails.vehicleDetails.type) {
    const vehicleDetailsType = payload.adrDetails.vehicleDetails.type.toLowerCase();
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
  return techRecordValidation.validate(payload, {context: {isTankOrBattery}});
};

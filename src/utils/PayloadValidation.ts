import {hgvValidation} from "./HgvValidations";
import ITechRecord from "../../@Types/ITechRecord";
import {VEHICLE_TYPE} from "../assets/Enums";
import Joi from "@hapi/joi";

// This will be expanded to other validations in the future. Currently validating only HGVs.
export const validatePayload = (payload: ITechRecord) => {
  if (payload.vehicleType === VEHICLE_TYPE.HGV || payload.vehicleType === VEHICLE_TYPE.TRL) {
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
    }
    return hgvValidation.validate(payload, {context: {isTankOrBattery, isBattery}});
  } else {
    return {
      error: {
        details: "Payload is not valid"
      }
    };
  }
};

export const validatePrimaryVrm = Joi.string().min(1).max(9);
export const validateSecondaryVrms = Joi.array().items(Joi.string().min(1).max(9)).min(1);

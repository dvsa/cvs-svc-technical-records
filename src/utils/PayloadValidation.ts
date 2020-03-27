import {hgvValidation} from "./HgvValidations";
import ITechRecord from "../../@Types/ITechRecord";
import {VEHICLE_TYPE, SEARCHCRITERIA} from "../assets/Enums";
import Joi from "@hapi/joi";
import {psvValidation} from "./PsvValidations";
import {trlValidation} from "./TrlValidations";

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

export const validatePayload = (payload: ITechRecord) => {
  const isTankOrBattery = checkIfTankOrBattery(payload);
  if (payload.vehicleType === VEHICLE_TYPE.HGV) {
    return hgvValidation.validate(payload, {context: {isTankOrBattery}});
  } else if (payload.vehicleType === VEHICLE_TYPE.PSV) {
    return psvValidation.validate(payload);
  } else if (payload.vehicleType === VEHICLE_TYPE.TRL) {
    return trlValidation.validate(payload, {context: {isTankOrBattery}});
  } else {
    return {
      error: {
        details: "\"vehicleType\" must be one of [hgv, psv, trl]"
      }
    };
  }
};

export const validatePrimaryVrm = Joi.string().min(1).max(9);
export const validateSecondaryVrms = Joi.array().items(Joi.string().min(1).max(9)).min(1);

export const isValidSearchCriteria = (specifiedCriteria: string): boolean => {
  const vals: string[] = Object.values(SEARCHCRITERIA);
  // return vals.includes(specifiedCriteria); //TODO reinstate for proper input validation
  return true;
};

import {hgvValidation} from "./HgvValidations";
import ITechRecord from "../../@Types/ITechRecord";
import {VEHICLE_TYPE} from "../assets/Enums";

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

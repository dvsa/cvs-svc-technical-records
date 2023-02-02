import Joi from "@hapi/joi";
import {commonSchemaLgvMotorcycleCar} from "./CommonSchema";
import {VEHICLE_CLASS_DESCRIPTION} from "../../assets/Enums";

export const motorcycleValidation = commonSchemaLgvMotorcycleCar.keys({
  numberOfWheelsDriven: Joi.number().min(0).max(9999).allow(null, ''),
  historicPrimaryVrm: Joi.string().optional(),
  historicSecondaryVrms: Joi.array().items(Joi.string()).optional(),
  vehicleClass: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...VEHICLE_CLASS_DESCRIPTION),
      then: Joi.string().optional(),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...VEHICLE_CLASS_DESCRIPTION)
  })
});

import Joi from "@hapi/joi";
import {VEHICLE_CLASS_DESCRIPTION, VEHICLE_SUBCLASS} from "../../assets/Enums";
import {commonSchemaLgvMotorcycleCar} from "./CommonSchema";

export const carValidation = commonSchemaLgvMotorcycleCar.keys({
  vehicleSubclass: Joi.array().items(Joi.string().valid(...VEHICLE_SUBCLASS)).allow(null, ''),
  vehicleClass: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...VEHICLE_CLASS_DESCRIPTION),
      then: Joi.string().optional(),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...VEHICLE_CLASS_DESCRIPTION)
  }).optional().allow(null)
});

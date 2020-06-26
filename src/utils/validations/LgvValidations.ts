import Joi from "@hapi/joi";
import {VEHICLE_CLASS_DESCRIPTION, VEHICLE_SUBCLASS} from "../../assets/Enums";
import {commonSchemaLgvMotorcycleCar} from "./CommonSchema";

export const lgvValidation = commonSchemaLgvMotorcycleCar.keys({
  vehicleSubclass: Joi.array().items(Joi.string().valid(...VEHICLE_SUBCLASS)).required(),
  vehicleClass: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...VEHICLE_CLASS_DESCRIPTION).required(),
      then: Joi.string().optional(),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...VEHICLE_CLASS_DESCRIPTION).required()
  }).optional().allow(null)
}).required();

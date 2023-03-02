import Joi from "@hapi/joi";
import { EU_VEHICLE_CATEGORY, STATUS_CODES, VEHICLE_CLASS_CODE, VEHICLE_CLASS_DESCRIPTION, VEHICLE_SUBCLASS, VEHICLE_TYPE } from "../../assets/Enums";
import { commonSchemaLgvCarSmallTrlMotorcycle } from "./CommonSchema";

export const smallTrailerValidation = commonSchemaLgvCarSmallTrlMotorcycle.keys({
  statusCode: Joi.string().valid(STATUS_CODES).optional(),
  vehicleType: Joi.string().valid(Object.values(VEHICLE_TYPE)).optional(),
  manufactureYear: Joi.number().min(1900).max(9999).optional(),
  noOfAxles: Joi.number().min(0).max(99).optional(),
  vehicleClass: Joi.object().keys({
<<<<<<< HEAD
    code: Joi.string().valid(VEHICLE_CLASS_CODE).optional(),
    description: Joi.string().valid(VEHICLE_CLASS_DESCRIPTION).optional()
  }).optional(),
  vehicleSubclass: Joi.string().valid(VEHICLE_SUBCLASS).optional(),
  euVehicleCategory: Joi.string().valid(Object.values(EU_VEHICLE_CATEGORY)).optional(),

  applicantDetails: Joi.object().keys({
    name: Joi.string().max(150).optional(),
    address1: Joi.string().max(60).optional(),
    address2: Joi.string().max(60).optional(),
    address3: Joi.string().max(60).optional(),
    postTown: Joi.string().max(60).optional(),
    postCode: Joi.string().max(12).optional(),
    emailAddress: Joi.string().max(255).optional(),
    telephonenumber: Joi.string().max(25).optional(),
  }).optional(),

  notes: Joi.string().max(1024).optional()
=======
    code: Joi.any().when("description", {
      is: Joi.string().valid(...VEHICLE_CLASS_DESCRIPTION),
      then: Joi.string().optional(),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...VEHICLE_CLASS_DESCRIPTION)
  }).optional().allow(null),
  notes: Joi.string().optional().allow(null, "")
>>>>>>> 7c31544fd2470f474e62f0265b32844952bec936
});

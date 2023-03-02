import Joi from "@hapi/joi";
import { EU_VEHICLE_CATEGORY, STATUS_CODES, VEHICLE_SUBCLASS, VEHICLE_TYPE } from "../../assets/Enums";
import { commonSchemaLgvCarSmallTrlMotorcycle } from "./CommonSchema";

export const carValidation = commonSchemaLgvCarSmallTrlMotorcycle.keys({
  statusCode: Joi.string().valid(...STATUS_CODES).optional(),
  vehicleType: Joi.string().valid(...Object.values(VEHICLE_TYPE)).optional(),
  regnDate: Joi.date().optional(),
  manufactureYear: Joi.number().min(1900).max(9999).optional(),
  noOfAxles: Joi.number().min(0).max(99).optional(),
  vehicleSubclass: Joi.array().items(Joi.string().valid(...VEHICLE_SUBCLASS)).optional(),
  euVehicleCategory: Joi.string().valid(...Object.values(EU_VEHICLE_CATEGORY)).optional(),

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
});

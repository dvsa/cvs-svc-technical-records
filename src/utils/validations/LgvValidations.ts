import Joi from "@hapi/joi";
import { EU_VEHICLE_CATEGORY, STATUS_CODES, VEHICLE_SUBCLASS, VEHICLE_TYPE } from "../../assets/Enums";
import { commonSchemaLgvCarSmallTrlMotorcycle } from "./CommonSchema";

export const lgvValidation = commonSchemaLgvCarSmallTrlMotorcycle.keys({
  historicPrimaryVrm: Joi.string().optional(),
  historicSecondaryVrms: Joi.array().items(Joi.string()).optional(),
  statusCode: Joi.string().valid(...STATUS_CODES).optional(),
  vehicleType: Joi.string().valid(...Object.values(VEHICLE_TYPE)).optional(),
  regnDate: Joi.date().optional().allow(null, ""),
  manufactureYear: Joi.number().min(1900).max(9999).optional().allow(null, ""),
  noOfAxles: Joi.number().min(0).max(99).optional().allow(null, ""),
  vehicleSubclass: Joi.array().items(Joi.string().valid(...VEHICLE_SUBCLASS)).optional(),
  euVehicleCategory: Joi.string().valid(...Object.values(EU_VEHICLE_CATEGORY)).optional().allow(null, ""),
  applicantDetails: Joi.object().keys({
    name: Joi.string().max(150).optional().allow(null, ""),
    address1: Joi.string().max(60).optional().allow(null, ""),
    address2: Joi.string().max(60).optional().allow(null, ""),
    address3: Joi.string().max(60).optional().allow(null, ""),
    postTown: Joi.string().max(60).optional().allow(null, ""),
    postCode: Joi.string().max(12).optional().allow(null, ""),
    emailAddress: Joi.string().max(255).optional().allow(null, ""),
    telephoneNumber: Joi.string().max(25).optional().allow(null, ""),
  }).optional(),
  notes: Joi.string().max(1024).optional().allow(null, ""),
});

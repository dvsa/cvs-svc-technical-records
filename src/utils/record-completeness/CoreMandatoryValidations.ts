/* tslint:disable */
const Joi = require("@hapi/joi")
  .extend(require("@hapi/joi-date"));

import {
  STATUS_CODES,
  VEHICLE_CLASS_DESCRIPTION,
  VEHICLE_CONFIGURATION,
  VEHICLE_SIZE,
  VEHICLE_SUBCLASS,
  VEHICLE_TYPE_VALIDATION
} from "../../assets/Enums";

export const coreMandatoryVehicleAttributes = Joi.object().keys({
  vin: Joi.string().required(),
  systemNumber: Joi.string().required()
}).required();

export const psvHgvCarLgvMotoCoreMandatoryVehicleAttributes = coreMandatoryVehicleAttributes.keys({
  primaryVrm: Joi.string().required()
}).required();

export const trlCoreMandatoryVehicleAttributes = coreMandatoryVehicleAttributes.keys({
  trailerId: Joi.string().required()
}).required();

// common fields for core mandatory attributes for all vehicle types
export const coreMandatoryCommonSchema = Joi.object().keys({
  vehicleType: Joi.string().valid(...VEHICLE_TYPE_VALIDATION).required(),
  noOfAxles: Joi.number().required(),
  statusCode: Joi.string().valid(...STATUS_CODES).required(),
  reasonForCreation: Joi.string().required(),
  createdAt: Joi.string().required()
}).required();

// common fields for core mandatory attributes for hgv, psv and trl
export const coreMandatoryCommonSchemaPsvHgvTrl = coreMandatoryCommonSchema.keys({
  vehicleConfiguration: Joi.string().valid(...VEHICLE_CONFIGURATION).required(),
  vehicleClass: Joi.object().keys({
    code: Joi.string().required(),
    description: Joi.string().valid(...VEHICLE_CLASS_DESCRIPTION).required()
  }).required()
}).required();

export const coreMandatoryCommonSchemaLgvMotorcycleCar = coreMandatoryCommonSchema;

export const psvCoreMandatorySchema = coreMandatoryCommonSchemaPsvHgvTrl.keys({
  vehicleSize: Joi.string().valid(...VEHICLE_SIZE).required(),
  seatsLowerDeck: Joi.number().required(),
  seatsUpperDeck: Joi.number().required(),
  numberOfWheelsDriven: Joi.number().optional()
}).required();

export const trlCoreMandatorySchema = coreMandatoryCommonSchemaPsvHgvTrl;
export const hgvCoreMandatorySchema = coreMandatoryCommonSchemaPsvHgvTrl.keys({
  numberOfWheelsDriven: Joi.number().optional()
});

export const carCoreMandatorySchema = coreMandatoryCommonSchemaLgvMotorcycleCar.keys({
  vehicleSubclass: Joi.array().items(Joi.string().valid(...VEHICLE_SUBCLASS)).required()
}).required();

export const lgvCoreMandatorySchema = carCoreMandatorySchema;

export const motorcycleCoreMandatorySchema = coreMandatoryCommonSchemaLgvMotorcycleCar.keys({
  vehicleClass: Joi.object().keys({
    code: Joi.string().required(),
    description: Joi.string().valid(...VEHICLE_CLASS_DESCRIPTION).required()
  }).required(),
  numberOfWheelsDriven: Joi.number().required()
}).required();

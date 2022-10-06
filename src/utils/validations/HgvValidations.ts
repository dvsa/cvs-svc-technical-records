import Joi from "@hapi/joi";
import {applicantDetailsSchemaOptional, axlesSchema, commonSchema, weightsSchema} from "./CommonSchema";
import {FUEL_PROPULSION_SYSTEM} from "../../assets/Enums";
import {adrValidation} from "./AdrValidation";

export const hgvValidation = commonSchema.keys({
  axles: Joi.array().items(axlesSchema.keys({
    weights: weightsSchema.keys({
      eecWeight: Joi.number().min(0).max(99999).optional().allow(null)
    }).required(),
  })).min(1).required(),
  roadFriendly: Joi.boolean().required(),
  drawbarCouplingFitted: Joi.boolean().required(),
  offRoad: Joi.boolean().optional().required(),
  make: Joi.string().max(30).required(),
  model: Joi.string().max(30).required(),
  speedLimiterMrk: Joi.boolean().required(),
  tachoExemptMrk: Joi.boolean().required(),
  euroStandard: Joi.string().required(),
  fuelPropulsionSystem: Joi.string().valid(...FUEL_PROPULSION_SYSTEM).required(),
  numberOfWheelsDriven: Joi.number().min(0).max(9999).required().allow(null),
  emissionsLimit: Joi.number().min(0).max(99).optional().allow(null, ''),
  trainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  grossEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  trainGbWeight: Joi.number().min(0).max(99999).required(),
  trainEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainGbWeight: Joi.number().min(0).max(99999).required(),
  maxTrainEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  tyreUseCode: Joi.string().max(2).optional().allow(null, ''),
  dimensions: Joi.object().keys({
    length: Joi.number().min(0).max(99999).required(),
    width: Joi.number().min(0).max(99999).required(),
    axleSpacing: Joi.array().items(Joi.object().keys({
      value: Joi.number().min(0).max(99999).optional().allow(null),
      axles: Joi.string().optional()
    })).optional()
  }).required(),
  frontAxleToRearAxle: Joi.number().min(0).max(99999).required(),
  frontAxleTo5thWheelCouplingMin: Joi.number().min(0).max(99999).optional().allow(null),
  frontAxleTo5thWheelCouplingMax: Joi.number().min(0).max(99999).optional().allow(null),
  frontAxleTo5thWheelMin: Joi.number().min(0).max(99999).optional().allow(null),
  frontAxleTo5thWheelMax: Joi.number().min(0).max(99999).optional().allow(null),
  notes: Joi.string().optional().allow(null, ''),
  adrDetails: adrValidation,
  applicantDetails: applicantDetailsSchemaOptional
}).required();

import Joi from "@hapi/joi";
import {applicantDetailsSchemaOptional, axlesSchema, commonSchema, weightsSchema} from "./CommonSchema";
import {FUEL_PROPULSION_SYSTEM} from "../../assets/Enums";
import {adrValidation} from "./AdrValidation";

export const hgvValidation = commonSchema.keys({
  axles: Joi.array().items(axlesSchema.keys({
    weights: weightsSchema.keys({
      eecWeight: Joi.number().min(0).max(99999).optional().allow(null)
    }),
  })).min(1),
  roadFriendly: Joi.boolean(),
  drawbarCouplingFitted: Joi.boolean(),
  offRoad: Joi.boolean().optional(),
  make: Joi.string().max(30),
  model: Joi.string().max(30),
  speedLimiterMrk: Joi.boolean(),
  tachoExemptMrk: Joi.boolean(),
  euroStandard: Joi.string(),
  fuelPropulsionSystem: Joi.string().valid(...FUEL_PROPULSION_SYSTEM),
  numberOfWheelsDriven: Joi.number().min(0).max(9999).optional().allow(null),
  emissionsLimit: Joi.number().min(0).max(99).optional().allow(null),
  trainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  grossEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  trainGbWeight: Joi.number().min(0).max(99999),
  trainEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainGbWeight: Joi.number().min(0).max(99999),
  maxTrainEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  tyreUseCode: Joi.string().max(2).optional().allow(null, ''),
  dimensions: Joi.object().keys({
    length: Joi.number().min(0).max(99999).optional().allow(null),
    width: Joi.number().min(0).max(99999).optional().allow(null),
    axleSpacing: Joi.array().items(Joi.object().keys({
      value: Joi.number().min(0).max(99999).optional().allow(null),
      axles: Joi.string().optional()
    })).optional()
  }),
  frontAxleToRearAxle: Joi.number().min(0).max(99999).optional().allow(null),
  frontAxleTo5thWheelCouplingMin: Joi.number().min(0).max(99999).optional().allow(null),
  frontAxleTo5thWheelCouplingMax: Joi.number().min(0).max(99999).optional().allow(null),
  frontAxleTo5thWheelMin: Joi.number().min(0).max(99999).optional().allow(null),
  frontAxleTo5thWheelMax: Joi.number().min(0).max(99999).optional().allow(null),
  notes: Joi.string().optional().allow(null, ''),
  adrDetails: adrValidation,
  applicantDetails: applicantDetailsSchemaOptional
});

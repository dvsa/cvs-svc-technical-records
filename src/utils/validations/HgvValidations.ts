import Joi from "@hapi/joi";
import {
  applicantDetailsSchemaOptional,
  axlesSchema,
  commonSchema,
  weightsSchema,
} from "./CommonSchema";
import { FUEL_PROPULSION_SYSTEM } from "../../assets/Enums";
import { adrValidation } from "./AdrValidation";

export const hgvValidation = commonSchema.keys({
  historicPrimaryVrm: Joi.string().optional(),
  historicSecondaryVrms: Joi.array().items(Joi.string()).optional(),
  axles: Joi.array().items(
    axlesSchema.keys({
      weights: weightsSchema.keys({
        eecWeight: Joi.number().min(0).max(99999).optional().allow(null),
      }),
    })
  ),
  roadFriendly: Joi.boolean().allow(null, ""),
  drawbarCouplingFitted: Joi.boolean().allow(null, ""),
  offRoad: Joi.boolean().optional().allow(null, ""),
  make: Joi.string().max(30).allow(null, ""),
  model: Joi.string().max(30).allow(null, ""),
  speedLimiterMrk: Joi.boolean().allow(null, ""),
  tachoExemptMrk: Joi.boolean().allow(null, ""),
  euroStandard: Joi.string().allow(null, ""),
  fuelPropulsionSystem: Joi.string()
    .valid(...FUEL_PROPULSION_SYSTEM)
    .allow(null, ""),
  numberOfWheelsDriven: Joi.number().min(0).max(9999).optional().allow(null),
  emissionsLimit: Joi.number().min(0).max(99).optional().allow(null),
  trainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  grossEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  trainGbWeight: Joi.number().min(0).max(99999).allow(null, ""),
  trainEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainGbWeight: Joi.number().min(0).max(99999).allow(null, ""),
  maxTrainEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  tyreUseCode: Joi.string().max(2).optional().allow(null, ""),
  dimensions: Joi.object().keys({
    length: Joi.number().min(0).max(99999).optional().allow(null),
    width: Joi.number().min(0).max(99999).optional().allow(null),
    axleSpacing: Joi.array()
      .items(
        Joi.object().keys({
          value: Joi.number().min(0).max(99999).optional().allow(null),
          axles: Joi.string().optional(),
        })
      )
      .optional(),
  }),
  frontAxleToRearAxle: Joi.number().min(0).max(99999).optional().allow(null),
  frontVehicleTo5thWheelCouplingMin: Joi.number()
    .min(0)
    .max(99999)
    .optional()
    .allow(null),
  frontVehicleTo5thWheelCouplingMax: Joi.number()
    .min(0)
    .max(99999)
    .optional()
    .allow(null),
  frontAxleTo5thWheelMin: Joi.number().min(0).max(99999).optional().allow(null),
  frontAxleTo5thWheelMax: Joi.number().min(0).max(99999).optional().allow(null),
  notes: Joi.string().optional().allow(null, ""),
  adrDetails: adrValidation,
  applicantDetails: applicantDetailsSchemaOptional,
});

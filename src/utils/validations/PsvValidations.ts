/* tslint:disable */
const Joi = require("@hapi/joi")
  .extend(require("@hapi/joi-date"));

import {
  FUEL_PROPULSION_SYSTEM,
  RETARDER_BRAKE,
  SPEED_CATEGORY_SYMBOL,
  VEHICLE_SIZE
} from "../../assets/Enums";
import {
  applicantDetailsSchemaOptional,
  axlesSchema,
  brakesSchema,
  commonSchema,
  tyresSchema,
  weightsSchema
} from "./CommonSchema";

export const psvValidation = commonSchema.keys({
  brakeCode: Joi.string().optional(),
  brakes: brakesSchema.keys({
    brakeCode: Joi.string().max(6),
    brakeCodeOriginal: Joi.string().optional(),
    dataTrBrakeOne: Joi.string().max(60),
    dataTrBrakeTwo: Joi.string().max(60),
    dataTrBrakeThree: Joi.string().max(60),
    retarderBrakeOne: Joi.string().valid(...RETARDER_BRAKE).optional().allow(null, ''),
    retarderBrakeTwo: Joi.string().valid(...RETARDER_BRAKE).optional().allow(null, ''),
    brakeForceWheelsNotLocked: Joi.object().keys({
      parkingBrakeForceA: Joi.number().min(0).max(99999),
      secondaryBrakeForceA: Joi.number().min(0).max(99999),
      serviceBrakeForceA: Joi.number().min(0).max(99999)
    }),
    brakeForceWheelsUpToHalfLocked: Joi.object().keys({
      parkingBrakeForceB: Joi.number().min(0).max(99999),
      secondaryBrakeForceB: Joi.number().min(0).max(99999),
      serviceBrakeForceB: Joi.number().min(0).max(99999)
    })
  }),
  dda: Joi.object().keys({
    certificateIssued: Joi.boolean().optional().allow(null, ''),
    wheelchairCapacity: Joi.number().min(0).max(99).optional().allow(null),
    wheelchairFittings: Joi.string().max(250).optional().allow(null, ''),
    wheelchairLiftPresent: Joi.boolean().optional().allow(null, ''),
    wheelchairLiftInformation: Joi.string().max(250).optional().allow(null, ''),
    wheelchairRampPresent: Joi.boolean().optional().allow(null, ''),
    wheelchairRampInformation: Joi.string().max(250).optional().allow(null, ''),
    minEmergencyExits: Joi.number().min(0).max(99).optional().allow(null),
    outswing: Joi.string().max(250).optional().allow(null, ''),
    ddaSchedules: Joi.string().max(250).optional().allow(null, ''),
    seatbeltsFitted: Joi.number().min(0).max(999).optional().allow(null),
    ddaNotes: Joi.string().max(1024).optional().allow(null, '')
  }),
  axles: Joi.array().items(axlesSchema.keys({
    weights: weightsSchema.keys({
      ladenWeight: Joi.number().min(0).max(99999),
      kerbWeight: Joi.number().min(0).max(99999)
    }),
    tyres: tyresSchema.keys({
      speedCategorySymbol: Joi.string().valid(...SPEED_CATEGORY_SYMBOL),
    }),
  })).min(1),
  seatsLowerDeck: Joi.number().min(0).max(999),
  seatsUpperDeck: Joi.number().min(0).max(99),
  standingCapacity: Joi.number().min(0).max(999),
  speedLimiterMrk: Joi.boolean(),
  tachoExemptMrk: Joi.boolean(),
  euroStandard: Joi.string(),
  fuelPropulsionSystem: Joi.string().valid(...FUEL_PROPULSION_SYSTEM),
  numberOfWheelsDriven: Joi.number().min(0).max(9999).optional().allow(null),
  emissionsLimit: Joi.number().min(0).max(99).optional().allow(null),
  trainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  vehicleSize: Joi.string().valid(...VEHICLE_SIZE),
  numberOfSeatbelts: Joi.string().max(99),
  seatbeltInstallationApprovalDate: Joi.string().optional().allow(null, ''),
  coifSerialNumber: Joi.string().max(8).optional().allow(null, ''),
  coifCertifierName: Joi.string().max(20).optional().allow(null, ''),
  coifDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null),
  bodyMake: Joi.string().max(20),
  bodyModel: Joi.string().max(20),
  chassisMake: Joi.string().max(20),
  chassisModel: Joi.string().max(20),
  modelLiteral: Joi.string().max(30).optional().allow(null, ''),
  speedRestriction: Joi.number().min(0).max(99).optional().allow(null),
  grossKerbWeight: Joi.number().min(0).max(99999),
  grossLadenWeight: Joi.number().min(0).max(99999),
  unladenWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainGbWeight: Joi.number().min(0).max(99999).optional().allow(null),
  dimensions: Joi.object().keys({
    length: Joi.number().min(0).max(99999).optional().allow(null),
    width: Joi.number().min(0).max(99999).optional().allow(null),
    height: Joi.number().min(0).max(99999).optional().allow(null),
  }).optional().allow(null, ''),
  frontAxleToRearAxle: Joi.number().min(0).max(99999).optional().allow(null),
  remarks: Joi.string().max(1024).optional().allow(null, ''),
  dispensations: Joi.string().max(160).optional().allow(null, ''),
  applicantDetails: applicantDetailsSchemaOptional
});

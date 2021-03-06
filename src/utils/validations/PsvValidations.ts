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
    brakeCode: Joi.string().max(6).required(),
    brakeCodeOriginal: Joi.string().optional(),
    dataTrBrakeOne: Joi.string().max(60).required(),
    dataTrBrakeTwo: Joi.string().max(60).required(),
    dataTrBrakeThree: Joi.string().max(60).required(),
    retarderBrakeOne: Joi.string().valid(...RETARDER_BRAKE).optional().allow(null),
    retarderBrakeTwo: Joi.string().valid(...RETARDER_BRAKE).optional().allow(null),
    brakeForceWheelsNotLocked: Joi.object().keys({
      parkingBrakeForceA: Joi.number().min(0).max(99999).required(),
      secondaryBrakeForceA: Joi.number().min(0).max(99999).required(),
      serviceBrakeForceA: Joi.number().min(0).max(99999).required()
    }).required(),
    brakeForceWheelsUpToHalfLocked: Joi.object().keys({
      parkingBrakeForceB: Joi.number().min(0).max(99999).required(),
      secondaryBrakeForceB: Joi.number().min(0).max(99999).required(),
      serviceBrakeForceB: Joi.number().min(0).max(99999).required()
    }).required()
  }).required(),
  dda: Joi.object().keys({
    certificateIssued: Joi.boolean().required(),
    wheelchairCapacity: Joi.number().min(0).max(99).optional().allow(null),
    wheelchairFittings: Joi.string().max(250).optional().allow(null),
    wheelchairLiftPresent: Joi.boolean().optional().allow(null),
    wheelchairLiftInformation: Joi.string().max(250).optional().allow(null),
    wheelchairRampPresent: Joi.boolean().optional().allow(null),
    wheelchairRampInformation: Joi.string().max(250).optional().allow(null),
    minEmergencyExits: Joi.number().min(0).max(99).optional().allow(null),
    outswing: Joi.string().max(250).optional().allow(null),
    ddaSchedules: Joi.string().max(250).optional().allow(null),
    seatbeltsFitted: Joi.number().min(0).max(999).optional().allow(null),
    ddaNotes: Joi.string().max(1024).optional().allow(null)
  }).required(),
  axles: Joi.array().items(axlesSchema.keys({
    weights: weightsSchema.keys({
      ladenWeight: Joi.number().min(0).max(99999).required(),
      kerbWeight: Joi.number().min(0).max(99999).required()
    }).required(),
    tyres: tyresSchema.keys({
      speedCategorySymbol: Joi.string().valid(...SPEED_CATEGORY_SYMBOL).required(),
    }).required(),
  })).min(1).required(),
  seatsLowerDeck: Joi.number().min(0).max(999).required(),
  seatsUpperDeck: Joi.number().min(0).max(99).required(),
  standingCapacity: Joi.number().min(0).max(999).required(),
  speedLimiterMrk: Joi.boolean().required(),
  tachoExemptMrk: Joi.boolean().required(),
  euroStandard: Joi.string().required(),
  fuelPropulsionSystem: Joi.string().valid(...FUEL_PROPULSION_SYSTEM).required(),
  numberOfWheelsDriven: Joi.number().min(0).max(9999).required().allow(null),
  emissionsLimit: Joi.number().min(0).max(99).optional().allow(null),
  trainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  vehicleSize: Joi.string().valid(...VEHICLE_SIZE).required(),
  numberOfSeatbelts: Joi.string().max(99).required(),
  seatbeltInstallationApprovalDate: Joi.string().optional().allow(null),
  coifSerialNumber: Joi.string().max(8).optional().allow(null),
  coifCertifierName: Joi.string().max(20).optional().allow(null),
  coifDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null),
  bodyMake: Joi.string().max(20).required(),
  bodyModel: Joi.string().max(20).required(),
  chassisMake: Joi.string().max(20).required(),
  chassisModel: Joi.string().max(20).required(),
  modelLiteral: Joi.string().max(30).optional().allow(null),
  speedRestriction: Joi.number().min(0).max(99).optional().allow(null),
  grossKerbWeight: Joi.number().min(0).max(99999).required(),
  grossLadenWeight: Joi.number().min(0).max(99999).required(),
  unladenWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainGbWeight: Joi.number().min(0).max(99999).optional().allow(null),
  dimensions: Joi.object().keys({
    length: Joi.number().min(0).max(99999).optional().allow(null),
    width: Joi.number().min(0).max(99999).optional().allow(null),
    height: Joi.number().min(0).max(99999).optional().allow(null),
  }).optional().allow(null),
  frontAxleToRearAxle: Joi.number().min(0).max(99999).optional().allow(null),
  remarks: Joi.string().max(1024).optional().allow(null),
  dispensations: Joi.string().max(160).optional().allow(null),
  applicantDetails: applicantDetailsSchemaOptional
}).required();

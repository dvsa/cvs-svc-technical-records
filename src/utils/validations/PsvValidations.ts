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
  brakeCode: Joi.string().optional().allow(null, ''),
  historicPrimaryVrm: Joi.string().optional(),
  historicSecondaryVrms: Joi.array().items(Joi.string()).optional(),
  brakes: brakesSchema.keys({
    brakeCode: Joi.string().max(6).allow(null, ''),
    brakeCodeOriginal: Joi.string().optional().allow(null, ''),
    dataTrBrakeOne: Joi.string().max(60).allow(null, ''),
    dataTrBrakeTwo: Joi.string().max(60).allow(null, ''),
    dataTrBrakeThree: Joi.string().max(60).allow(null, ''),
    retarderBrakeOne: Joi.string().valid(...RETARDER_BRAKE).optional().allow(null, ''),
    retarderBrakeTwo: Joi.string().valid(...RETARDER_BRAKE).optional().allow(null, ''),
    brakeForceWheelsNotLocked: Joi.object().keys({
      parkingBrakeForceA: Joi.number().min(0).max(99999).allow(null, ''),
      secondaryBrakeForceA: Joi.number().min(0).max(99999).allow(null, ''),
      serviceBrakeForceA: Joi.number().min(0).max(99999).allow(null, '')
    }),
    brakeForceWheelsUpToHalfLocked: Joi.object().keys({
      parkingBrakeForceB: Joi.number().min(0).max(99999).allow(null, ''),
      secondaryBrakeForceB: Joi.number().min(0).max(99999).allow(null, ''),
      serviceBrakeForceB: Joi.number().min(0).max(99999).allow(null, '')
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
      ladenWeight: Joi.number().min(0).max(99999).allow(null, ''),
      kerbWeight: Joi.number().min(0).max(99999).allow(null, '')
    }),
    tyres: tyresSchema.keys({
      speedCategorySymbol: Joi.string().valid(...SPEED_CATEGORY_SYMBOL).allow(null, ''),
    }),
  })).min(1),
  seatsLowerDeck: Joi.number().min(0).max(999).allow(null, ''),
  seatsUpperDeck: Joi.number().min(0).max(99).allow(null, ''),
  standingCapacity: Joi.number().min(0).max(999).allow(null, ''),
  speedLimiterMrk: Joi.boolean().allow(null, ''),
  tachoExemptMrk: Joi.boolean().allow(null, ''),
  euroStandard: Joi.string().allow(null, ''),
  fuelPropulsionSystem: Joi.string().valid(...FUEL_PROPULSION_SYSTEM).allow(null, ''),
  numberOfWheelsDriven: Joi.number().min(0).max(9999).optional().allow(null).allow(null, ''),
  emissionsLimit: Joi.number().min(0).max(99).optional().allow(null).allow(null, ''),
  trainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null).allow(null, ''),
  vehicleSize: Joi.string().valid(...VEHICLE_SIZE).allow(null, ''),
  numberOfSeatbelts: Joi.string().max(99).allow(null, ''),
  seatbeltInstallationApprovalDate: Joi.string().optional().allow(null, '').allow(null, ''),
  coifSerialNumber: Joi.string().max(8).optional().allow(null, '').allow(null, ''),
  coifCertifierName: Joi.string().max(20).optional().allow(null, '').allow(null, ''),
  coifDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null, ''),
  bodyMake: Joi.string().max(20).allow(null, ''),
  bodyModel: Joi.string().max(20).allow(null, ''),
  chassisMake: Joi.string().max(20).allow(null, ''),
  chassisModel: Joi.string().max(20).allow(null, ''),
  modelLiteral: Joi.string().max(30).optional().allow(null, ''),
  speedRestriction: Joi.number().min(0).max(99).optional().allow(null, ''),
  grossKerbWeight: Joi.number().min(0).max(99999).allow(null, ''),
  grossLadenWeight: Joi.number().min(0).max(99999).allow(null, ''),
  unladenWeight: Joi.number().min(0).max(99999).optional().allow(null, ''),
  maxTrainGbWeight: Joi.number().min(0).max(99999).optional().allow(null, ''),
  dimensions: Joi.object().keys({
    length: Joi.number().min(0).max(99999).optional().allow(null),
    width: Joi.number().min(0).max(99999).optional().allow(null),
    height: Joi.number().min(0).max(99999).optional().allow(null),
  }).optional().allow(null, ''),
  frontAxleToRearAxle: Joi.number().min(0).max(99999).optional().allow(null,''),
  remarks: Joi.string().max(1024).optional().allow(null, ''),
  dispensations: Joi.string().max(160).optional().allow(null, ''),
  applicantDetails: applicantDetailsSchemaOptional
});

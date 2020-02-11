/* tslint:disable */
const Joi = require("@hapi/joi")
  .extend(require("@hapi/joi-date"));

import {
  approvalType,
  bodyTypeDescription, euVehicleCategory, fitmentCode,
  fuelPropulsionSystem, microfilmDocumentType, plateReasonForIssue,
  retarderBrake, speedCategorySymbol, vehicleClassDescription,
  vehicleConfiguration, vehicleSize, vehicleType
} from "./ValidationUtils";

export const psvValidation = Joi.object().keys({
  vehicleType: Joi.string().valid(...vehicleType).required(),
  regnDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null),
  manufactureYear: Joi.number().min(0).max(9999).required(),
  noOfAxles: Joi.number().min(0).max(99).required(),
  brakeCode: Joi.string().optional(),
  brakes: Joi.object().keys({
    dtpNumber: Joi.string().max(6).required(),
    brakeCode: Joi.string().max(6).required(),
    brakeCodeOriginal: Joi.string().optional(),
    dataTrBrakeOne: Joi.string().max(60).required(),
    dataTrBrakeTwo: Joi.string().max(60).required(),
    dataTrBrakeThree: Joi.string().max(60).required(),
    retarderBrakeOne: Joi.string().valid(...retarderBrake).optional().allow(null),
    retarderBrakeTwo: Joi.string().valid(...retarderBrake).optional().allow(null),
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
  axles: Joi.array().items(Joi.object().keys({
    parkingBrakeMrk: Joi.boolean().optional().allow(null),
    axleNumber: Joi.number().min(0).max(99999).required(),
    weights: Joi.object().keys({
      gbWeight: Joi.number().min(0).max(99999).required(),
      designWeight: Joi.number().min(0).max(99999).required(),
      ladenWeight: Joi.number().min(0).max(99999).required(),
      kerbWeight: Joi.number().min(0).max(99999).required()
    }).required(),
    tyres: Joi.object().keys({
      tyreCode: Joi.number().min(0).max(9999).required(),
      tyreSize: Joi.string().max(12).required(),
      plyRating: Joi.string().max(2).optional().allow(null),
      speedCategorySymbol: Joi.string().valid(...speedCategorySymbol).required(),
      fitmentCode: Joi.string().valid(...fitmentCode).required(),
      dataTrAxles: Joi.number().min(0).max(999).optional().allow(null)
    }).required(),
  })).required(),
  speedLimiterMrk: Joi.boolean().required(),
  tachoExemptMrk: Joi.boolean().required(),
  euroStandard: Joi.string().required(),
  fuelPropulsionSystem: Joi.string().valid(...fuelPropulsionSystem).required(),
  vehicleClass: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...vehicleClassDescription).required(),
      then: Joi.string().optional(),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...vehicleClassDescription).required()
  }).required(),
  vehicleConfiguration: Joi.string().valid(...vehicleConfiguration).required(),
  numberOfWheelsDriven: Joi.number().min(0).max(9999).required(),
  euVehicleCategory: Joi.string().valid(...euVehicleCategory).required(),
  emissionsLimit: Joi.number().min(0).max(99).optional().allow(null),
  seatsLowerDeck: Joi.number().min(0).max(999).required(),
  seatsUpperDeck: Joi.number().min(0).max(99).required(),
  standingCapacity: Joi.number().min(0).max(999).required(),
  vehicleSize: Joi.string().valid(...vehicleSize).required(),
  numberOfSeatbelts: Joi.string().max(99).required(),
  seatbeltInstallationApprovalDate: Joi.string().optional().allow(null),
  departmentalVehicleMarker: Joi.boolean().optional(),
  alterationMarker: Joi.boolean().optional(),
  approvalType: Joi.string().valid(...approvalType).required(),
  approvalTypeNumber: Joi.string().max(25).optional().allow(null),
  ntaNumber: Joi.string().max(40).optional().allow(null),
  coifSerialNumber: Joi.string().max(8).optional().allow(null),
  coifCertifierName: Joi.string().max(20).optional().allow(null),
  coifDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null),
  variantNumber: Joi.string().max(25).optional().allow(null),
  variantVersionNumber: Joi.string().max(35).optional().allow(null),
  bodyMake: Joi.string().max(20).required(),
  bodyModel: Joi.string().max(20).required(),
  chassisMake: Joi.string().max(20).required(),
  chassisModel: Joi.string().max(20).required(),
  modelLiteral: Joi.string().max(30).optional().allow(null),
  speedRestriction: Joi.number().min(0).max(99).optional().allow(null),
  bodyType: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...bodyTypeDescription).required(),
      then: Joi.string().optional(),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...bodyTypeDescription).required()
  }).required(),
  functionCode: Joi.string().max(1).optional().allow(null),
  conversionRefNo: Joi.string().max(10).optional().allow(null),
  grossGbWeight: Joi.number().min(0).max(99999).required(),
  grossKerbWeight: Joi.number().min(0).max(99999).required(),
  grossLadenWeight: Joi.number().min(0).max(99999).required(),
  grossDesignWeight: Joi.number().min(0).max(99999).required(),
  unladenWeight: Joi.number().min(0).max(99999).optional().allow(null),
  trainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainGbWeight: Joi.number().min(0).max(99999).optional().allow(null),
  dimensions: Joi.object().keys({
    length: Joi.number().min(0).max(99999).optional().allow(null),
    width: Joi.number().min(0).max(99999).optional().allow(null),
    height: Joi.number().min(0).max(99999).optional().allow(null),
  }).required(),
  frontAxleToRearAxle: Joi.number().min(0).max(99999).optional().allow(null),
  remarks: Joi.string().max(1024).optional().allow(null),
  dispensations: Joi.string().max(160).optional().allow(null),
  applicantDetails: Joi.object().keys({
    name: Joi.string().max(150).optional().allow(null),
    address1: Joi.string().max(60).optional().allow(null),
    address2: Joi.string().max(60).optional().allow(null),
    postTown: Joi.string().max(60).optional().allow(null),
    address3: Joi.string().max(60).optional().allow(null),
    postCode: Joi.string().max(12).optional().allow(null),
    telephoneNumber: Joi.string().max(25).optional().allow(null),
    emailAddress: Joi.string().max(255).optional().allow(null)
  }).required(),
  microfilm: Joi.object().keys({
    microfilmDocumentType: Joi.string().valid(...microfilmDocumentType).optional().allow(null),
    microfilmRollNumber: Joi.string().max(5).optional().allow(null),
    microfilmSerialNumber: Joi.string().max(4).optional().allow(null)
  }).optional().allow(null),
  plates: Joi.array().items(Joi.object().keys({
    plateSerialNumber: Joi.string().max(12).optional().allow(null),
    plateIssueDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null),
    plateReasonForIssue: Joi.string().valid(...plateReasonForIssue).optional().allow(null),
    plateIssuer: Joi.string().max(150).optional().allow(null)
  })).optional().allow(null),
  reasonForCreation: Joi.string().max(100).required(),
  createdAt: Joi.string().optional().allow(null),
  createdByName: Joi.string().optional(),
  createdById: Joi.string().optional(),
  lastUpdatedAt: Joi.string().optional().allow(null),
  lastUpdatedByName: Joi.string().optional(),
  lastUpdatedById: Joi.string().optional()
}).required();

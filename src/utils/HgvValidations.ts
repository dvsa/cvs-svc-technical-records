/* tslint:disable */
import ITechRecord from "../../@Types/ITechRecord";

const Joi = require("@hapi/joi")
  .extend(require("@hapi/joi-date"));

import {adrValidation} from "./AdrValidation";
import {
  approvalType,
  bodyTypeDescription, euVehicleCategory, fitmentCode,
  fuelPropulsionSystem, microfilmDocumentType, plateReasonForIssue, vehicleClassDescription,
  vehicleConfiguration, vehicleType
} from "./ValidationEnums";

export const hgvValidation = Joi.object().keys({
  vehicleType: Joi.string().valid(...vehicleType).required(),
  regnDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null),
  manufactureYear: Joi.number().min(0).max(9999).required(),
  noOfAxles: Joi.number().min(0).max(99).required(),
  brakes: Joi.object().keys({
    dtpNumber: Joi.string().max(6).required(),
  }).required(),
  axles: Joi.array().items(Joi.object().keys({
    parkingBrakeMrk: Joi.boolean().optional().allow(null),
    axleNumber: Joi.number().min(0).max(99999).required(),
    weights: Joi.object().keys({
      gbWeight: Joi.number().min(0).max(99999).required(),
      eecWeight: Joi.number().min(0).max(99999).optional().allow(null),
      designWeight: Joi.number().min(0).max(99999).required()
    }).required(),
    tyres: Joi.object().keys({
      tyreCode: Joi.number().min(0).max(9999).required(),
      tyreSize: Joi.string().max(12).required(),
      plyRating: Joi.string().max(2).optional().allow(null),
      fitmentCode: Joi.string().valid(...fitmentCode).required(),
      dataTrAxles: Joi.number().min(0).max(999).optional().allow(null)
    }).required(),
  })).required(),
  speedLimiterMrk: Joi.boolean().required(),
  tachoExemptMrk: Joi.boolean().required(),
  euroStandard: Joi.string().required(),
  fuelPropulsionSystem: Joi.string().valid(...fuelPropulsionSystem).required(),
  roadFriendly: Joi.boolean().required(),
  drawbarCouplingFitted: Joi.boolean().required(),
  vehicleClass: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...vehicleClassDescription).required(),
      then: Joi.string().optional(),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...vehicleClassDescription).required()
  }).required(),
  vehicleConfiguration: Joi.string().valid(...vehicleConfiguration).required(),
  offRoad: Joi.boolean().optional().required(),
  numberOfWheelsDriven: Joi.number().min(0).max(9999).required().allow(null),
  euVehicleCategory: Joi.string().valid(...euVehicleCategory).required(),
  emissionsLimit: Joi.number().min(0).max(99).optional().allow(null),
  departmentalVehicleMarker: Joi.boolean().optional(),
  alterationMarker: Joi.boolean().optional(),
  approvalType: Joi.string().valid(...approvalType).required(),
  approvalTypeNumber: Joi.string().max(25).optional().allow(null),
  ntaNumber: Joi.string().max(40).optional().allow(null),
  variantNumber: Joi.string().max(25).optional().allow(null),
  variantVersionNumber: Joi.string().max(35).optional().allow(null),
  make: Joi.string().max(30).required(),
  model: Joi.string().max(30).required(),
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
  grossEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  grossDesignWeight: Joi.number().min(0).max(99999).required(),
  trainGbWeight: Joi.number().min(0).max(99999).required(),
  trainEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  trainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainGbWeight: Joi.number().min(0).max(99999).required(),
  maxTrainEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  tyreUseCode: Joi.string().max(2).optional().allow(null),
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
  applicantDetails: Joi.object().keys({
    name: Joi.string().max(150).required(),
    address1: Joi.string().max(60).required(),
    address2: Joi.string().max(60).required(),
    postTown: Joi.string().max(60).required(),
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
  notes: Joi.string().optional().allow(null),
  reasonForCreation: Joi.string().max(100).required(),
  adrDetails: adrValidation,
  createdAt: Joi.string().optional().allow(null),
  createdByName: Joi.string().optional(),
  createdById: Joi.string().optional(),
  lastUpdatedAt: Joi.string().optional().allow(null),
  lastUpdatedByName: Joi.string().optional(),
  lastUpdatedById: Joi.string().optional()
}).required();

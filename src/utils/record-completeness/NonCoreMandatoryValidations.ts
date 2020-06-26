/* tslint:disable */
const Joi = require("@hapi/joi")
  .extend(require("@hapi/joi-date"));

import {
  APPROVAL_TYPE,
  BODY_TYPE_DESCRIPTION,
  EU_VEHICLE_CATEGORY_VALIDATION,
  FITMENT_CODE,
  FUEL_PROPULSION_SYSTEM, SPEED_CATEGORY_SYMBOL
} from "../../assets/Enums";
import {brakesSchema, weightsSchema} from "../validations/CommonSchema";


export const nonCoreTyresSchema = Joi.object().keys({
  tyreCode: Joi.number().required(),
  tyreSize: Joi.string().required(),
  fitmentCode: Joi.string().valid(...FITMENT_CODE).required()
}).required();

export const nonCoreAxlesSchema = Joi.object().keys({
  weights: weightsSchema,
  tyres: nonCoreTyresSchema
}).required();

export const nonCoreApplicantDetailsSchema = Joi.object().keys({
  name: Joi.string().max(150).required(),
  address1: Joi.string().max(60).required(),
  address2: Joi.string().max(60).required(),
  postTown: Joi.string().max(60).required()
}).required();

export const nonCoreMandatoryCommonSchemaPsvHgvTrl = Joi.object().keys({
  approvalType: Joi.string().valid(...APPROVAL_TYPE).required(),
  manufactureYear: Joi.number().required(),
  bodyType: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...BODY_TYPE_DESCRIPTION).required(),
      then: Joi.string().optional(),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...BODY_TYPE_DESCRIPTION).required()
  }).required(),
  grossGbWeight: Joi.number().min(0).max(99999).required(),
  grossDesignWeight: Joi.number().min(0).max(99999).required(),
  brakes: brakesSchema,
  euVehicleCategory: Joi.string().valid(...EU_VEHICLE_CATEGORY_VALIDATION).required(),
  axles: Joi.array().items(nonCoreAxlesSchema).min(1).required()
}).required();

export const psvNonCoreMandatorySchema = nonCoreMandatoryCommonSchemaPsvHgvTrl.keys({
  euroStandard: Joi.string().required(),
  regnDate: Joi.date().format("YYYY-MM-DD").required(),
  speedLimiterMrk: Joi.boolean().required(),
  tachoExemptMrk: Joi.boolean().required(),
  fuelPropulsionSystem: Joi.string().valid(...FUEL_PROPULSION_SYSTEM).required(),
  axles: Joi.array().items(nonCoreAxlesSchema.keys({
    parkingBrakeMrk: Joi.boolean().required(),
    axleNumber: Joi.number().required(),
    weights: weightsSchema.keys({
      ladenWeight: Joi.number().required(),
      kerbWeight: Joi.number().required()
    }).required(),
    tyres: nonCoreTyresSchema.keys({
      speedCategorySymbol: Joi.string().valid(...SPEED_CATEGORY_SYMBOL).required(),
    }).required(),
  })).min(1).required(),
  standingCapacity: Joi.number().required(),
  numberOfSeatbelts: Joi.string().required(),
  bodyMake: Joi.string().required(),
  bodyModel: Joi.string().required(),
  chassisMake: Joi.string().required(),
  chassisModel: Joi.string().required(),
  grossKerbWeight: Joi.number().required(),
  grossLadenWeight: Joi.number().required(),
  dda: Joi.object().keys({
    certificateIssued: Joi.boolean().required()
  }).required(),
  brakes: brakesSchema.keys({
    brakeCode: Joi.string().required(),
    dataTrBrakeOne: Joi.string().required(),
    dataTrBrakeTwo: Joi.string().required(),
    dataTrBrakeThree: Joi.string().required(),
    brakeForceWheelsNotLocked: Joi.object().keys({
      parkingBrakeForceA: Joi.number().required(),
      secondaryBrakeForceA: Joi.number().required(),
      serviceBrakeForceA: Joi.number().required()
    }).required(),
    brakeForceWheelsUpToHalfLocked: Joi.object().keys({
      parkingBrakeForceB: Joi.number().required(),
      secondaryBrakeForceB: Joi.number().required(),
      serviceBrakeForceB: Joi.number().required()
    }).required()
  }).required()
}).required();

export const hgvNonCoreMandatorySchema = nonCoreMandatoryCommonSchemaPsvHgvTrl.keys({
  make: Joi.string().required(),
  model: Joi.string().required(),
  trainGbWeight: Joi.number().required(),
  maxTrainGbWeight: Joi.number().required(),
  tyreUseCode: Joi.string().required(),
  euroStandard: Joi.string().required(),
  dimensions: Joi.object().keys({
    length: Joi.number().required(),
    width: Joi.number().required(),
  }).required(),
  frontAxleTo5thWheelMin: Joi.number().required(),
  frontAxleTo5thWheelMax: Joi.number().required(),
  frontAxleToRearAxle: Joi.number().required(),
  notes: Joi.string().required(),
  regnDate: Joi.date().format("YYYY-MM-DD").required(),
  speedLimiterMrk: Joi.boolean().required(),
  tachoExemptMrk: Joi.boolean().required(),
  fuelPropulsionSystem: Joi.string().valid(...FUEL_PROPULSION_SYSTEM).required(),
  roadFriendly: Joi.boolean().required(),
  drawbarCouplingFitted: Joi.boolean().required(),
  offRoad: Joi.boolean().optional().required(),
  applicantDetails: nonCoreApplicantDetailsSchema
});

export const trlNonCoreMandatorySchema = nonCoreMandatoryCommonSchemaPsvHgvTrl.keys({
  primaryVrm: Joi.string().required(),
  make: Joi.string().required(),
  model: Joi.string().required(),
  firstUseDate: Joi.date().format("YYYY-MM-DD").required(),
  maxLoadOnCoupling: Joi.number().required(),
  tyreUseCode: Joi.string().required(),
  suspensionType: Joi.string().required(),
  couplingType: Joi.string().required(),
  dimensions: Joi.object().keys({
    length: Joi.number().required(),
    width: Joi.number().required(),
    axleSpacing: Joi.array().items(Joi.object().keys({
      value: Joi.number().required(),
      axles: Joi.string().required()
    })).min(1).required()
  }).required(),
  frontAxleToRearAxle: Joi.number().required(),
  rearAxleToRearTrl: Joi.number().required(),
  couplingCenterToRearAxleMin: Joi.number().required(),
  couplingCenterToRearAxleMax: Joi.number().required(),
  couplingCenterToRearTrlMin: Joi.number().required(),
  couplingCenterToRearTrlMax: Joi.number().required(),
  centreOfRearmostAxleToRearOfTrl: Joi.number().required(),
  notes: Joi.string().required(),
  axles: Joi.array().items(nonCoreAxlesSchema.keys({
    parkingBrakeMrk: Joi.boolean().required(),
    brakes: Joi.object().keys({
      brakeActuator: Joi.number().required(),
      leverLength: Joi.number().required(),
    }).required()
  })).min(1).required(),
  brakes: brakesSchema.keys({
    antilockBrakingSystem: Joi.boolean().required()
  }).required(),
  roadFriendly: Joi.boolean().required(),
  applicantDetails: nonCoreApplicantDetailsSchema,
  purchaserDetails: nonCoreApplicantDetailsSchema,
  manufacturerDetails: nonCoreApplicantDetailsSchema
});

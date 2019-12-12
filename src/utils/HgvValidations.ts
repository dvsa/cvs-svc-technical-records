/* tslint:disable */
const Joi = require("@hapi/joi")
  .extend(require("@hapi/joi-date"));

const statusCode: string[] = [
  "archived",
  "current",
  "provisional"
];

const vehicleType: string[] = [
  "psv",
  "trl",
  "hgv"
];

const fuelPropulsionSystem: string[] = [
  "DieselPetrol",
  "Hybrid",
  "Electric",
  "CNG",
  "Fuel cell",
  "LNG",
  "Other"
];

const vehicleClassCode: string[] = [
  "2",
  "n",
  "s",
  "1",
  "t",
  "l",
  "3",
  "v",
  "4",
  "7",
  "5"
];

const vehicleClassDescription: string[] = [
  "motorbikes over 200cc or with a sidecar",
  "not applicable",
  "small psv (ie: less than or equal to 22 seats)",
  "motorbikes up to 200cc",
  "trailer",
  "large psv(ie: greater than 23 seats)",
  "3 wheelers",
  "heavy goods vehicle",
  "MOT class 4",
  "MOT class 7",
  "MOT class 5"
];

const vehicleConfiguration: string[] = [
  "rigid",
  "articulated",
  "centre axle drawbar",
  "semi-car transporter",
  "semi-trailer",
  "low loader",
  "other",
  "drawbar",
  "four-in-line",
  "dolly",
  "full drawbar"
];

const euVehicleCategory: string[] = [
  "m1",
  "m2",
  "m3",
  "n1",
  "n2",
  "n3",
  "o1",
  "o2",
  "o3",
  "o4"
];

const approvalType: string[] = [
  "NTA",
  "ECTA",
  "IVA",
  "NSSTA",
  "ECSSTA"
];

const bodyTypeDescription: string[] = [
  "articulated",
  "single decker",
  "double decker",
  "other",
  "petrol/oil tanker",
  "skeletal",
  "tipper",
  "box",
  "flat",
  "refuse",
  "skip loader",
  "refrigerated"
];

const populateVehicleClassCode = (parent, helpers) => {
  if (parent.description === "motorbikes over 200cc or with a sidecar") {
    return "2";
  }
  throw new Error("Not valid");
};

const populateBodyTypeCode = (parent, helpers) => {
  if (parent.description === "articulated") {
    return "a";
  }
  throw new Error("Not valid");
};

const populateAxleSpacing = (parent, helpers) => {

};

export const hgvValidations = Joi.object().keys({
  statusCode: Joi.string().valid(...statusCode).required(),
  vehicleType: Joi.string().valid(...vehicleType).required(),
  regnDate: Joi.date().format("YYYY-MM-DD").required(),
  manufactureYear: Joi.number().max(9999).required(),
  noOfAxles: Joi.number().max(99).required(),
  dtpNumber: Joi.string().max(6).required(),
  axles: Joi.array().items(Joi.object().keys({
    parkingBrakeMrk: Joi.boolean().optional()
  })).required(),
  speedLimiterMrk: Joi.boolean().optional().default(false),
  tachoExemptMrk: Joi.boolean().optional().default(false),
  euroStandard: Joi.string().required(),
  fuelPropulsionSystem: Joi.string().valid(...fuelPropulsionSystem).required(),
  roadFriendly: Joi.boolean().optional().default(false),
  drawbarCouplingFitted: Joi.boolean().optional().default(false),
  vehicleClass: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...vehicleClassDescription).required(),
      then: Joi.string().default(populateVehicleClassCode),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...vehicleClassDescription).optional()
  }).default({}),
  vehicleConfiguration: Joi.string().valid(...vehicleConfiguration).required(),
  offRoad: Joi.boolean().optional().default(false),
  numberOfWheelsDriven: Joi.number().max(9999).required(),
  euVehicleCategory: Joi.string().valid(...euVehicleCategory).required(),
  emissionsLimit: Joi.number.max(99).optional(),
  departmentalVehicleMarker: Joi.boolean().optional().default(false),
  alterationMarker: Joi.boolean().optional().default(false),
  approvalType: Joi.string().valid(...approvalType).required(),
  approvalTypeNumber: Joi.string().max(25).optional(),
  ntaNumber: Joi.string().max(40).optional(),
  variantNumber: Joi.number().max(25).optional(),
  variantVersionNumber: Joi.number().max(35).optional(),
  make: Joi.string().max(30).required(),
  model: Joi.string().max(30).required(),
  bodyType: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...bodyTypeDescription).required(),
      then: Joi.string().default(populateBodyTypeCode),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...bodyTypeDescription).optional()
  }).default({}),
  functionCode: Joi.string().max(1).optional(),
  conversionRefNo: Joi.string().max(10).optional(),
  grossGbWeight: Joi.number().min(0).max(99999).required(),
  grossEecWeight: Joi.number().min(0).max(99999).optional(),
  grossDesignWeight: Joi.number().min(0).max(99999).required(),
  trainGbWeight: Joi.number().min(0).max(99999).required(),
  trainEecWeight: Joi.number().min(0).max(99999).optional(),
  trainDesignWeight: Joi.number().min(0).max(99999).optional(),
  maxTrainGbWeight: Joi.number().min(0).max(99999).required(),
  maxTrainEecWeight: Joi.number().min(0).max(99999).optional(),
  maxTrainDesignWeight: Joi.number().min(0).max(99999).optional(),
  tyreUseCode: Joi.string().max(2).optional(),
  dimensions: Joi.object().keys({
    length: Joi.number().max(99999).required(),
    width: Joi.number().max(99999).required(),
    axleSpacing: Joi.array().items(Joi.object().keys({
      value: Joi.number().max(99999).optional()  // auto populate axles
    }))
  }).required(),
  frontAxleToRearAxle: Joi.number().max(99999).required(),
  frontAxleTo5thWheelCouplingMin: Joi.number().max(99999).optional(),
  frontAxleTo5thWheelCouplingMax: Joi.number().max(99999).optional(),
  frontAxleTo5thWheelMin: Joi.number().max(99999).required(),
  frontAxleTo5thWheelMax: Joi.number().max(99999).required(),

}).required();

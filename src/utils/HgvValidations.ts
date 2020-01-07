/* tslint:disable */
const Joi = require("@hapi/joi")
  .extend(require("@hapi/joi-date"));

import {adrValidation} from "./AdrValidation";

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

const microfilmDocumentType: string[] = [
  "PSV Miscellaneous",
  "AAT - Trailer Annual Test",
  "AIV - HGV International App",
  "COIF Modification",
  "Trailer COC + Int Plate",
  "RCT - Trailer Test Cert paid",
  "HGV COC + Int Plate",
  "PSV Carry/Auth",
  "OMO Report",
  "AIT - Trailer International App",
  "IPV - HGV EEC Plate/Cert",
  "XCV - HGV Test Cert free",
  "AAV - HGV Annual Test",
  "COIF Master",
  "Tempo 100 Sp Ord",
  "Deleted",
  "PSV N/ALT",
  "XPT - Tr Plating Cert paid",
  "FFV - HGV First Test",
  "Repl Vitesse 100",
  "TCV - HGV Test Cert",
  "ZZZ -  Miscellaneous",
  "Test Certificate",
  "XCT - Trailer Test Cert free",
  "C52 - COC and VTG52A",
  "Tempo 100 Report",
  "Main File Amendment",
  "PSV Doc",
  "PSV COC",
  "PSV Repl COC",
  "TAV - COC",
  "NPT - Trailer Alteration",
  "OMO Certificate",
  "PSV Repl COIF",
  "PSV Repl COF",
  "COIF Application",
  "XPV - HGV Plating Cert Free",
  "TCT  - Trailer Test Cert",
  "Tempo 100 App",
  "PSV Decision on N/ALT",
  "Special Order PSV",
  "NPV - HGV Alteration",
  "No Description Found",
  "Vitesse 100 Sp Ord",
  "Brake Test Details",
  "COIF Productional",
  "RDT - Test Disc Paid",
  "RCV -  HGV Test Cert",
  "FFT -  Trailer First Test",
  "IPT - Trailer EEC Plate/Cert",
  "XDT - Test Disc Free",
  "PRV - HGV Plating Cert paid",
  "COF Cert",
  "PRT - Tr Plating Cert paid",
  "Tempo 100 Permit"
];

const plateReasonForIssue: string[] = [
  "Free replacement",
  "Replacement",
  "Destroyed",
  "Provisional",
  "Original",
  "Manual"
];

const fitmentCode: string[] = [
  "double",
  "single"
];

const populateVehicleClassCode = (parent: any, helpers: any) => {
  // if (parent.description === "motorbikes over 200cc or with a sidecar") {
  //   return "2";
  // }
  // throw new Error("Not valid");
  return "2";
};

const populateBodyTypeCode = (parent: any, helpers: any) => {
  // if (parent.description === "articulated") {
  //   return "a";
  // }
  // throw new Error("Not valid");
  return "a";
};

export const hgvValidation = Joi.object().keys({
  vehicleType: Joi.string().valid(...vehicleType).required(),
  regnDate: Joi.date().format("YYYY-MM-DD").required(),
  manufactureYear: Joi.number().max(9999).required(),
  noOfAxles: Joi.number().max(99).required(),
  dtpNumber: Joi.string().max(6).required(),
  axles: Joi.array().items(Joi.object().keys({
    parkingBrakeMrk: Joi.boolean().optional(),
    axleNumber: Joi.number().max(99999).required(),
    weights: Joi.object().keys({
      gbWeight: Joi.number().max(99999).required(),
      eecWeight: Joi.number().max(99999).optional(),
      designWeight: Joi.number().max(99999).required()
    }).required(),
    tyres: Joi.object().keys({
      tyreCode: Joi.number().max(9999).required(),
      tyreSize: Joi.string().max(12).required(),
      plyRating: Joi.string().max(2).required(),
      fitmentCode: Joi.string().valid(...fitmentCode).required(),
      dataTrAxles: Joi.number().max(999).optional()
    }).required(),
  })).required(),
  speedLimiterMrk: Joi.boolean().default(false),
  tachoExemptMrk: Joi.boolean().default(false),
  euroStandard: Joi.string().required(),
  fuelPropulsionSystem: Joi.string().valid(...fuelPropulsionSystem).required(),
  roadFriendly: Joi.boolean().default(false),
  drawbarCouplingFitted: Joi.boolean().default(false),
  vehicleClass: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...vehicleClassDescription).required(),
      then: Joi.string().default(populateVehicleClassCode),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...vehicleClassDescription).required()
  }).required(),
  vehicleConfiguration: Joi.string().valid(...vehicleConfiguration).required(),
  offRoad: Joi.boolean().optional().default(false),
  numberOfWheelsDriven: Joi.number().max(9999).required(),
  euVehicleCategory: Joi.string().valid(...euVehicleCategory).required(),
  emissionsLimit: Joi.number().max(99).optional(),
  departmentalVehicleMarker: Joi.boolean().default(false),
  alterationMarker: Joi.boolean().default(false),
  approvalType: Joi.string().valid(...approvalType).required(),
  approvalTypeNumber: Joi.string().max(25).optional(),
  ntaNumber: Joi.string().max(40).optional(),
  variantNumber: Joi.string().max(25).optional(),
  variantVersionNumber: Joi.string().max(35).optional(),
  make: Joi.string().max(30).required(),
  model: Joi.string().max(30).required(),
  bodyType: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...bodyTypeDescription).required(),
      then: Joi.string().default(populateBodyTypeCode),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...bodyTypeDescription).required()
  }).required(),
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
      value: Joi.number().max(99999).optional(),
      axles: Joi.string().optional()
    })).optional()
  }).required(),
  frontAxleToRearAxle: Joi.number().max(99999).required(),
  frontAxleTo5thWheelCouplingMin: Joi.number().max(99999).optional(),
  frontAxleTo5thWheelCouplingMax: Joi.number().max(99999).optional(),
  frontAxleTo5thWheelMin: Joi.number().max(99999).required(),
  frontAxleTo5thWheelMax: Joi.number().max(99999).required(),
  applicantDetails: Joi.object().keys({
    name: Joi.string().max(150).required(),
    address1: Joi.string().max(60).required(),
    address2: Joi.string().max(60).required(),
    postTown: Joi.string().max(60).required(),
    address3: Joi.string().max(60).optional(),
    postCode: Joi.string().max(12).optional(),
    telephoneNumber: Joi.string().max(25).optional(),
    emailAddress: Joi.string().max(255).optional()
  }).required(),
  microfilm: Joi.object().keys({
    microfilmDocumentType: Joi.string().valid(...microfilmDocumentType).optional(),
    microfilmRollNumber: Joi.string().max(5).optional(),
    microfilmSerialNumber: Joi.string().max(4).optional()
  }).optional(),
  plates: Joi.array().items(Joi.object().keys({
    plateSerialNumber: Joi.string().max(12).optional(),
    plateIssueDate: Joi.date().format("YYYY-MM-DD").optional(),
    plateReasonForIssue: Joi.string().valid(...plateReasonForIssue).optional(),
    plateIssuer: Joi.string().max(150).optional()
  })).optional(),
  notes: Joi.string().optional(),
  reasonForCreation: Joi.string().max(100).required(),
  adrDetails: adrValidation,
  createdAt: Joi.string().optional(),
  createdByName: Joi.string().optional(),
  createdById: Joi.string().optional(),
  lastUpdatedAt: Joi.string().optional(),
  lastUpdatedByName: Joi.string().optional(),
  lastUpdatedById: Joi.string().optional()
}).required();

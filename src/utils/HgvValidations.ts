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

export const vehicleClassDescription: string[] = [
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
  "o4",
  "l1e-a",
  "l1e",
  "l2e",
  "l3e",
  "l4e",
  "l5e",
  "l6e",
  "l7e"
];

const approvalType: string[] = [
  "NTA",
  "ECTA",
  "IVA",
  "NSSTA",
  "ECSSTA"
];

export const bodyTypeDescription: string[] = [
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

export const populateVehicleClassCode = (parent: any, helpers: any) => {
  switch (parent.description) {
    case "motorbikes over 200cc or with a sidecar":
      return "2";
    case "not applicable":
      return "n";
    case "small psv (ie: less than or equal to 22 seats)":
      return "s";
    case "motorbikes up to 200cc":
      return "1";
    case "trailer":
      return "t";
    case "large psv(ie: greater than 23 seats)":
      return "l";
    case "3 wheelers":
      return "3";
    case "heavy goods vehicle":
      return "v";
    case "MOT class 4":
      return "4";
    case "MOT class 7":
      return "7";
    case "MOT class 5":
      return "5";
    default:
      throw new Error("Not valid");
  }
};

export const populateBodyTypeCode = (parent: any, helpers: any) => {
  switch (parent.description) {
    case "articulated":
      return "a";
    case "single decker":
      return "s";
    case "double decker":
      return "d";
    case "other":
      return "o";
    case "petrol/oil tanker":
      return "p";
    case "skeletal":
      return "k";
    case "tipper":
      return "t";
    case "box":
      return "b";
    case "flat":
      return "f";
    case "refuse":
      return "r";
    case "skip loader":
      return "s";
    case "refrigerated":
      return "c";
    default:
      throw new Error("Not valid");
  }
};

export const hgvValidation = Joi.object().keys({
  vehicleType: Joi.string().valid(...vehicleType).required().allow(null),
  regnDate: Joi.date().format("YYYY-MM-DD").optional().allow(null),
  manufactureYear: Joi.number().min(0).max(9999).required().allow(null),
  noOfAxles: Joi.number().min(0).max(99).required().allow(null),
  brakes: Joi.object().keys({
    dtpNumber: Joi.string().max(6).required().allow(null),
  }).required(),
  axles: Joi.array().items(Joi.object().keys({
    parkingBrakeMrk: Joi.boolean().optional().allow(null),
    axleNumber: Joi.number().min(0).max(99999).required().allow(null),
    weights: Joi.object().keys({
      gbWeight: Joi.number().min(0).max(99999).required().allow(null),
      eecWeight: Joi.number().min(0).max(99999).optional().allow(null),
      designWeight: Joi.number().min(0).max(99999).required().allow(null)
    }).required(),
    tyres: Joi.object().keys({
      tyreCode: Joi.number().min(0).max(9999).required().allow(null),
      tyreSize: Joi.string().max(12).required().allow(null),
      plyRating: Joi.string().max(2).optional().allow(null),
      fitmentCode: Joi.string().valid(...fitmentCode).required().allow(null),
      dataTrAxles: Joi.number().min(0).max(999).optional().allow(null)
    }).required(),
  })).required(),
  speedLimiterMrk: Joi.boolean().required(),
  tachoExemptMrk: Joi.boolean().required(),
  euroStandard: Joi.string().required().allow(null),
  fuelPropulsionSystem: Joi.string().valid(...fuelPropulsionSystem).required().allow(null),
  roadFriendly: Joi.boolean().required(),
  drawbarCouplingFitted: Joi.boolean().required(),
  vehicleClass: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...vehicleClassDescription).required().allow(null),
      then: Joi.string().default(populateVehicleClassCode),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...vehicleClassDescription).required()
  }).required(),
  vehicleConfiguration: Joi.string().valid(...vehicleConfiguration).required().allow(null),
  offRoad: Joi.boolean().optional().required(),
  numberOfWheelsDriven: Joi.number().min(0).max(9999).required().allow(null),
  euVehicleCategory: Joi.string().valid(...euVehicleCategory).required().allow(null),
  emissionsLimit: Joi.number().min(0).max(99).optional().allow(null),
  departmentalVehicleMarker: Joi.boolean().default(false),
  alterationMarker: Joi.boolean().default(false),
  approvalType: Joi.string().valid(...approvalType).required().allow(null),
  approvalTypeNumber: Joi.string().max(25).optional().allow(null),
  ntaNumber: Joi.string().max(40).optional().allow(null),
  variantNumber: Joi.string().max(25).optional().allow(null),
  variantVersionNumber: Joi.string().max(35).optional().allow(null),
  make: Joi.string().max(30).required().allow(null),
  model: Joi.string().max(30).required().allow(null),
  bodyType: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...bodyTypeDescription).required().allow(null),
      then: Joi.string().default(populateBodyTypeCode),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...bodyTypeDescription).required()
  }).required(),
  functionCode: Joi.string().max(1).optional().allow(null),
  conversionRefNo: Joi.string().max(10).optional().allow(null),
  grossGbWeight: Joi.number().min(0).max(99999).required().allow(null),
  grossEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  grossDesignWeight: Joi.number().min(0).max(99999).required().allow(null),
  trainGbWeight: Joi.number().min(0).max(99999).required().allow(null),
  trainEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  trainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainGbWeight: Joi.number().min(0).max(99999).required().allow(null),
  maxTrainEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  maxTrainDesignWeight: Joi.number().min(0).max(99999).optional().allow(null),
  tyreUseCode: Joi.string().max(2).optional().allow(null),
  dimensions: Joi.object().keys({
    length: Joi.number().min(0).max(99999).required().allow(null),
    width: Joi.number().min(0).max(99999).required().allow(null),
    axleSpacing: Joi.array().items(Joi.object().keys({
      value: Joi.number().min(0).max(99999).optional().allow(null),
      axles: Joi.string().optional()
    })).optional()
  }).required(),
  frontAxleToRearAxle: Joi.number().min(0).max(99999).required().allow(null),
  frontAxleTo5thWheelCouplingMin: Joi.number().min(0).max(99999).optional().allow(null),
  frontAxleTo5thWheelCouplingMax: Joi.number().min(0).max(99999).optional().allow(null),
  frontAxleTo5thWheelMin: Joi.number().min(0).max(99999).required().allow(null),
  frontAxleTo5thWheelMax: Joi.number().min(0).max(99999).required().allow(null),
  applicantDetails: Joi.object().keys({
    name: Joi.string().max(150).required().allow(null),
    address1: Joi.string().max(60).required().allow(null),
    address2: Joi.string().max(60).required().allow(null),
    postTown: Joi.string().max(60).required().allow(null),
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
    plateIssueDate: Joi.date().format("YYYY-MM-DD").optional().allow(null),
    plateReasonForIssue: Joi.string().valid(...plateReasonForIssue).optional().allow(null),
    plateIssuer: Joi.string().max(150).optional().allow(null)
  })).optional().allow(null),
  notes: Joi.string().optional().allow(null),
  reasonForCreation: Joi.string().max(100).required().allow(null),
  adrDetails: adrValidation,
  createdAt: Joi.string().optional().allow(null),
  createdByName: Joi.string().optional(),
  createdById: Joi.string().optional(),
  lastUpdatedAt: Joi.string().optional().allow(null),
  lastUpdatedByName: Joi.string().optional(),
  lastUpdatedById: Joi.string().optional()
}).required();

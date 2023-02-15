/* tslint:disable */
const Joi = require("@hapi/joi")
  .extend(require("@hapi/joi-date"));

import {
  APPROVAL_TYPE,
  BODY_TYPE_DESCRIPTION,
  FITMENT_CODE,
  MICROFILM_DOCUMENT_TYPE,
  PLATE_REASON_FOR_ISSUE,
  VEHICLE_CLASS_DESCRIPTION,
  VEHICLE_CONFIGURATION,
  VEHICLE_TYPE_VALIDATION,
  RECORD_COMPLETENESS,
  EU_VEHICLE_CATEGORY_VALIDATION,
  STATUS_CODES
} from "../../assets/Enums";

export const brakesSchema = Joi.object().keys({
  dtpNumber: Joi.string().max(6).allow(null, ''),
});

export const weightsSchema = Joi.object().keys({
  gbWeight: Joi.number().min(0).max(99999).allow(null, ''),
  designWeight: Joi.number().min(0).max(99999).allow(null, '')
});

export const tyresSchema = Joi.object().keys({
  tyreCode: Joi.number().min(0).max(9999).allow(null, ''),
  tyreSize: Joi.string().max(12).allow(null, ''),
  plyRating: Joi.string().max(2).optional().allow(null, ''),
  fitmentCode: Joi.string().valid(...FITMENT_CODE).allow(null, ''),
  dataTrAxles: Joi.number().min(0).max(999).optional().allow(null)
});

export const axlesSchema = Joi.object().keys({
  parkingBrakeMrk: Joi.boolean().optional().allow(null, ''),
  axleNumber: Joi.number().min(0).max(99999).allow(null, ''),
  weights: weightsSchema,
  tyres: tyresSchema
});

export const platesSchema = Joi.object().keys({
  plateSerialNumber: Joi.string().max(12).optional().allow(null, ''),
  plateIssueDate: Joi.string().optional().allow(null, ''),
  plateReasonForIssue: Joi.string().valid(...PLATE_REASON_FOR_ISSUE).optional().allow(null, ''),
  plateIssuer: Joi.string().max(150).optional().allow(null, '')
});

export const microfilmSchema = Joi.object().keys({
  microfilmDocumentType: Joi.string().valid(...MICROFILM_DOCUMENT_TYPE).optional().allow(null, ''),
  microfilmRollNumber: Joi.string().max(5).optional().allow(null, ''),
  microfilmSerialNumber: Joi.string().max(4).optional().allow(null, '')
}).optional().allow(null);

export const applicantDetailsSchema = Joi.object().keys({
  name: Joi.string().max(150).allow(null, ''),
  address1: Joi.string().max(60).allow(null, ''),
  address2: Joi.string().max(60).allow(null, ''),
  postTown: Joi.string().max(60).allow(null, ''),
  address3: Joi.string().max(60).optional().allow(null, ''),
  postCode: Joi.string().max(12).optional().allow(null, ''),
  telephoneNumber: Joi.string().max(25).optional().allow(null, ''),
  emailAddress: Joi.string().max(255).optional().allow(null, '')
});

export const applicantDetailsSchemaOptional = Joi.object().keys({
  name: Joi.string().max(150).optional().allow(null, ''),
  address1: Joi.string().max(60).optional().allow(null, ''),
  address2: Joi.string().max(60).optional().allow(null, ''),
  postTown: Joi.string().max(60).optional().allow(null, ''),
  address3: Joi.string().max(60).optional().allow(null, ''),
  postCode: Joi.string().max(12).optional().allow(null, ''),
  telephoneNumber: Joi.string().max(25).optional().allow(null, ''),
  emailAddress: Joi.string().max(255).optional().allow(null, '')
}).optional().allow(null);

export const commonSchema = Joi.object().keys({
  hiddenInVta: Joi.boolean().optional().allow(null),
  recordCompleteness: Joi.string().valid(...RECORD_COMPLETENESS).optional().allow(null, ''),
  euVehicleCategory: Joi.string().valid(...EU_VEHICLE_CATEGORY_VALIDATION).allow(null, ''),
  vehicleType: Joi.string().valid(...VEHICLE_TYPE_VALIDATION),
  regnDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null).allow(null, ''),
  manufactureYear: Joi.number().min(0).max(9999).allow(null, ''),
  noOfAxles: Joi.number().min(0).max(99).allow(null, ''),
  brakes: brakesSchema,
  axles: Joi.array().items(axlesSchema).min(1).allow(null, ''),
  vehicleClass: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...VEHICLE_CLASS_DESCRIPTION).required(),
      then: Joi.string().optional(),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...VEHICLE_CLASS_DESCRIPTION).required()
  }).required(),
  vehicleConfiguration: Joi.string().valid(...VEHICLE_CONFIGURATION).allow(null, ''),
  departmentalVehicleMarker: Joi.boolean().optional().allow(null, ''),
  alterationMarker: Joi.boolean().optional().allow(null, ''),
  approvalType: Joi.string().valid(...APPROVAL_TYPE).allow(null, ''),
  approvalTypeNumber: Joi.string().max(25).optional().allow(null, ''),
  ntaNumber: Joi.string().max(40).optional().allow(null, ''),
  variantNumber: Joi.string().max(25).optional().allow(null, ''),
  variantVersionNumber: Joi.string().max(35).optional().allow(null, ''),
  bodyType: Joi.object().keys({
    code: Joi.any().when("description", {
      is: Joi.string().valid(...BODY_TYPE_DESCRIPTION).required(),
      then: Joi.string().optional(),
      otherwise: Joi.object().forbidden()
    }),
    description: Joi.string().valid(...BODY_TYPE_DESCRIPTION).required()
  }),
  functionCode: Joi.string().max(1).optional().allow(null, ''),
  conversionRefNo: Joi.string().max(10).optional().allow(null, ''),
  grossGbWeight: Joi.number().min(0).max(99999).allow(null, ''),
  grossDesignWeight: Joi.number().min(0).max(99999).allow(null, ''),
  applicantDetails: applicantDetailsSchemaOptional,
  microfilm: microfilmSchema,
  plates: Joi.array().items(platesSchema).optional().allow(null, ''),
  reasonForCreation: Joi.string().max(100).allow(null, ''),
  createdAt: Joi.string().optional().allow(null, ''),
  createdByName: Joi.string().optional().allow(null, ''),
  createdById: Joi.string().optional().allow(null, ''),
  lastUpdatedAt: Joi.string().optional().allow(null, ''),
  lastUpdatedByName: Joi.string().optional().allow(null, ''),
  lastUpdatedById: Joi.string().optional().allow(null, ''),
  statusCode: Joi.string().valid(...STATUS_CODES)
});

export const commonSchemaLgvCarSmallTrlMotorcycle = Joi.object().keys({
  vehicleType: Joi.string().valid(...VEHICLE_TYPE_VALIDATION).allow(null, ''),
  regnDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null, ''),
  manufactureYear: Joi.number().min(0).max(9999).optional().allow(null, ''),
  noOfAxles: Joi.number().min(0).max(99).allow(null, ''),
  euVehicleCategory: Joi.string().valid(...EU_VEHICLE_CATEGORY_VALIDATION).optional().allow(null, ''),
  applicantDetails: applicantDetailsSchemaOptional,
  remarks: Joi.string().max(1024).optional().allow(null).allow(null, ''),
  reasonForCreation: Joi.string().max(100).allow(null, ''),
  recordCompleteness: Joi.string().valid(...RECORD_COMPLETENESS).optional().allow(null, ''),
  hiddenInVta: Joi.boolean().optional().allow(null, ''),
  createdAt: Joi.string().optional().allow(null, ''),
  createdByName: Joi.string().optional().allow(null, ''),
  createdById: Joi.string().optional().allow(null, ''),
  lastUpdatedAt: Joi.string().optional().allow(null, ''),
  lastUpdatedByName: Joi.string().optional().allow(null, ''),
  lastUpdatedById: Joi.string().optional().allow(null, ''),
  statusCode: Joi.string().valid(...STATUS_CODES)
});

/* tslint:disable */
const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));

import {
  applicantDetailsSchema,
  applicantDetailsSchemaOptional,
  axlesSchema,
  brakesSchema,
  commonSchema,
  weightsSchema,
} from "./CommonSchema";
import {
  FRAME_DESCRIPTION,
  LETTER_TYPE,
  PARAGRAPH_IDS,
} from "../../assets/Enums";
import { adrValidation } from "./AdrValidation";

const authIntoService = Joi.object()
  .keys({
    cocIssueDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null),
    dateReceived: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null),
    datePending: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null),
    dateAuthorised: Joi.date()
      .format("YYYY-MM-DD")
      .raw()
      .optional()
      .allow(null),
    dateRejected: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null),
  })
  .optional()
  .allow(null);

const letterOfAuth = Joi.object()
  .keys({
    letterType: Joi.string()
      .valid(...LETTER_TYPE)
      .optional()
      .allow(null, ""),
    letterDateRequested: Joi.date().raw().optional().allow(null),
    letterContents: Joi.string().optional().allow(null, ""),
    paragraphId: Joi.number()
      .valid(...PARAGRAPH_IDS)
      .optional()
      .allow(null, ""),
    letterIssuer: Joi.string().optional().allow(null, ""),
  })
  .optional()
  .allow(null);

export const trlValidation = commonSchema.keys({
  firstUseDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null),
  suspensionType: Joi.string().max(1).optional().allow(null, ""),
  couplingType: Joi.string().max(1).optional().allow(null, ""),
  maxLoadOnCoupling: Joi.number().min(0).max(99999).optional().allow(null),
  frameDescription: Joi.string()
    .valid(...FRAME_DESCRIPTION)
    .optional()
    .allow(null, ""),
  authIntoService: authIntoService,
  letterOfAuth: letterOfAuth,
  make: Joi.string().max(50).allow(null, ""),
  model: Joi.string().max(30).allow(null, ""),
  grossEecWeight: Joi.number().min(0).max(99999).optional().allow(null),
  axles: Joi.array().items(
    axlesSchema.keys({
      weights: weightsSchema.keys({
        eecWeight: Joi.number().min(0).max(99999).optional().allow(null),
      }),
      brakes: Joi.object()
        .keys({
          brakeActuator: Joi.number().min(0).max(999).optional().allow(null),
          leverLength: Joi.number().min(0).max(999).optional().allow(null),
          springBrakeParking: Joi.boolean().optional().allow(null, ""),
        })
        .optional()
        .allow(null, ""),
    })
  ),
  roadFriendly: Joi.boolean().allow(null, ""),
  tyreUseCode: Joi.string().max(2).optional().allow(null, ""),
  brakes: brakesSchema.keys({
    loadSensingValve: Joi.boolean().optional().allow(null, ""),
    antilockBrakingSystem: Joi.boolean().allow(null, ""),
  }),
  dimensions: Joi.object().keys({
    length: Joi.number().min(0).max(99999).optional().allow(null),
    width: Joi.number().min(0).max(99999).optional().allow(null),
    axleSpacing: Joi.array()
      .items(
        Joi.object().keys({
          value: Joi.number().min(0).max(99999).optional().allow(null),
          axles: Joi.string().optional(),
        })
      )
      .optional(),
  }),
  frontAxleToRearAxle: Joi.number().min(0).max(99999).optional().allow(null),
  rearAxleToRearTrl: Joi.number().min(0).max(99999).allow(null, ""),
  couplingCenterToRearAxleMin: Joi.number().min(0).max(99999).allow(null, ""),
  couplingCenterToRearAxleMax: Joi.number().min(0).max(99999).allow(null, ""),
  couplingCenterToRearTrlMin: Joi.number().min(0).max(99999).allow(null, ""),
  couplingCenterToRearTrlMax: Joi.number().min(0).max(99999).allow(null, ""),
  centreOfRearmostAxleToRearOfTrl: Joi.number()
    .min(0)
    .max(99999)
    .allow(null, ""),
  purchaserDetails: applicantDetailsSchema.keys({
    faxNumber: Joi.string().max(25).optional().allow(null, ""),
    purchaserNotes: Joi.string().max(1024).optional().allow(null, ""),
  }),
  manufacturerDetails: applicantDetailsSchema
    .keys({
      faxNumber: Joi.string().max(25).optional().allow(null, ""),
      manufacturerNotes: Joi.string().max(1024).optional().allow(null, ""),
    })
    .allow(null),
  notes: Joi.string().optional().allow(null, ""),
  adrDetails: adrValidation,
  applicantDetails: applicantDetailsSchemaOptional,
  batchId: Joi.string().optional().allow(null, ""),
});

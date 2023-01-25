/* tslint:disable */
const Joi = require("@hapi/joi")
  .extend(require("@hapi/joi-date"));

const tc2Types: string[] = [
  "initial"
];

const tc3Types: string[] = [
  "intermediate",
  "periodic",
  "exceptional"
];

export const adrValidation = Joi.object().keys({
  vehicleDetails: Joi.object().keys({
    type: Joi.string().required().allow(null, ''),
    approvalDate: Joi.date().format("YYYY-MM-DD").raw().required().allow(null, '')
  }).required(),
  permittedDangerousGoods: Joi.array().items(Joi.string()).optional().allow(null, ''),
  compatibilityGroupJ: Joi.boolean().optional().allow(null).allow(null, ''),
  additionalExaminerNotes: Joi.string().max(1024).optional().allow(null).allow(null, ''),
  applicantDetails: Joi.object().keys({
    name: Joi.string().max(150).required().allow(null, ''),
    street: Joi.string().max(150).required().allow(null, ''),
    town: Joi.string().max(100).required().allow(null, ''),
    city: Joi.string().max(100).required().allow(null, ''),
    postcode: Joi.string().max(25).required().allow(null, '')
  }).required(),
  memosApply: Joi.array().items(Joi.string().allow(null, '')).optional().allow(null, ''),
  documents: Joi.array().items(Joi.string().allow(null, '')).optional().allow(null, ''),
  listStatementApplicable: Joi.boolean().optional().allow(null, ''),
  batteryListNumber: Joi.any().when("listStatementApplicable", {
    is: Joi.boolean().valid(true).required(),
    then: Joi.string().max(8).required().allow(null, ''),
    otherwise: Joi.valid(null)
  }),
  brakeDeclarationsSeen: Joi.boolean().optional().allow(null, ''),
  brakeDeclarationIssuer: Joi.string().optional().allow(null, ''),
  brakeEndurance: Joi.boolean().optional().allow(null, ''),
  weight: Joi.any().when("brakeEndurance", {
    is: Joi.boolean().valid(true).required(),
    then: Joi.string().max(8).required().allow(null, ''),
    otherwise: Joi.valid(null)
  }),
  declarationsSeen: Joi.boolean().optional().allow(null, ''),
  additionalNotes: Joi.object().keys({
    guidanceNotes: Joi.array().items(Joi.string().allow(null, '')).optional().allow(null, ''),
    number: Joi.array().items(Joi.string().allow(null, '')).optional().allow(null, '')
  }).optional().allow(null, ''),
  adrTypeApprovalNo: Joi.string().optional().allow(null, ''),
  adrCertificateNotes: Joi.string().max(1500).optional().allow("", null),
  tank: Joi.object().when("$isTankOrBattery", {
    is: Joi.boolean().valid(true).required(),
    then: Joi.object().keys({
      tankDetails: Joi.object().keys({
        tankManufacturer: Joi.string().max(70).required().allow(null, ''),
        yearOfManufacture: Joi.number().max(9999).required().allow(null, ''),
        tankManufacturerSerialNo: Joi.string().max(50).required().allow(null, ''),
        tankTypeAppNo: Joi.string().max(30).optional().allow("", null),
        tankCode: Joi.string().max(30).required().allow(null, ''),
        specialProvisions: Joi.string().max(1024).optional().allow(null, ''),
        tc2Details: Joi.object().keys({
          tc2Type: Joi.string().valid(...tc2Types).optional().allow(null, ''),
          tc2IntermediateApprovalNo: Joi.string().max(70).optional().allow(null, ''),
          tc2IntermediateExpiryDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null, '')
        }).optional().allow(null, ''),
        tc3Details: Joi.array().items(Joi.object().keys({
          tc3Type: Joi.string().valid(...tc3Types).optional().allow(null, ''),
          tc3PeriodicNumber: Joi.string().max(75).optional().allow(null, ''),
          tc3PeriodicExpiryDate: Joi.date().format("YYYY-MM-DD").raw().optional().allow(null, '')
        })).optional().allow(null)
      }).required(),
      tankStatement: Joi.object().keys({
        substancesPermitted: Joi.string().required().allow(null, ''),
        statement: Joi.string().max(1500).optional().allow(null, ''),
        productListRefNo: Joi.string().optional().allow(null, ''),
        productListUnNo: Joi.array().items(Joi.string().allow(null, '')).optional().allow(null, ''),
        productList: Joi.string().max(1500).optional().allow(null, '')
      }).required()
    }).required(),
    otherwise: Joi.object().keys({
      tankDetails: Joi.object().keys({
        tankManufacturer: Joi.valid(null, ''),
        yearOfManufacture: Joi.valid(null, ''),
        tankManufacturerSerialNo: Joi.valid(null, ''),
        tankTypeAppNo: Joi.valid(null, ''),
        tankCode: Joi.valid(null, ''),
        specialProvisions: Joi.valid(null, ''),
        tc2Details: Joi.object().keys({
          tc2Type: Joi.valid(null, ''),
          tc2IntermediateApprovalNo: Joi.valid(null, ''),
          tc2IntermediateExpiryDate: Joi.valid(null, ''),
        }).optional().allow(null, ''),
        tc3Details: Joi.array().items(Joi.object().keys({
          tc3Type: Joi.valid(null, ''),
          tc3PeriodicNumber: Joi.valid(null, ''),
          tc3PeriodicExpiryDate: Joi.valid(null, ''),
        })).optional().allow(null, '')
      }).optional().allow(null, ''),
      tankStatement: Joi.object().keys({
        substancesPermitted: Joi.valid(null, ''),
        statement: Joi.valid(null, ''),
        productListRefNo: Joi.valid(null, ''),
        productListUnNo: Joi.array().items(null, '').optional().allow(null, ''),
        productList: Joi.valid(null, ''),
      }).optional().allow(null, '')
    }).optional().allow(null, '')
  })
}).optional().allow(null, '');

export const validateOnlyAdr = Joi.object().keys({
  adrDetails: adrValidation.optional(),
  reasonForCreation: Joi.string().max(100).required().allow(null, '')
}).required();

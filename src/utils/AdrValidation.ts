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

export const validateAdr = (adrObject: any) => {
  return adrValidation.validate(adrObject, {context: {isTankOrBattery: true, isBattery: true}});
};

const adrValidation = Joi.object().keys({
  vehicleDetails: Joi.object().keys({
    type: Joi.string().required(),
    approvalDate: Joi.date().format("YYYY-MM-DD").required()
  }).required(),
  permittedDangerousGoods: Joi.array().items(Joi.string()).min(1).required(),
  compatibilityGroupJ: Joi.boolean().optional(),
  additionalExaminerNotes: Joi.string().optional(),
  applicantDetails: Joi.object().keys({
    name: Joi.string().max(150).required(),
    street: Joi.string().max(150).required(),
    town: Joi.string().max(100).required(),
    city: Joi.string().max(100).required(),
    postcode: Joi.string().max(25).required()
  }).required(),
  memosApply: Joi.any().when("$isTankOrBattery", {
    is: Joi.boolean().valid(true).required(),
    then: Joi.array().items(Joi.string()).optional(),
    otherwise: Joi.object().forbidden()
  }),
  documents: Joi.any().when("$isTankOrBattery", {
    is: Joi.boolean().valid(true).required(),
    then: Joi.array().items(Joi.string()).optional(),
    otherwise: Joi.object().forbidden()
  }),
  listStatementApplicable: Joi.any().when("$isBattery", {
    is: Joi.boolean().valid(true).required(),
    then: Joi.boolean().optional(),
    otherwise: Joi.object().forbidden()
  }),
  batteryListNumber: Joi.any().when("listStatementApplicable", {
    is: Joi.boolean().valid(true).required(),
    then: Joi.string().max(8).required(),
    otherwise: Joi.object().forbidden()
  }),
  brakeDeclarationsSeen: Joi.boolean().optional(),
  brakeDeclarationIssuer: Joi.string().optional(),
  brakeEndurance: Joi.boolean().optional(),
  weight: Joi.any().when("brakeEndurance", {
    is: Joi.boolean().valid(true).required(),
    then: Joi.string().max(8).required(),
    otherwise: Joi.object().forbidden()
  }),
  declarationsSeen: Joi.boolean().optional(),
  additionalNotes: Joi.object().keys({
    guidanceNotes: Joi.array().items(Joi.string()).optional(),
    number: Joi.array().items(Joi.string()).optional()
  }).optional(),
  adrTypeApprovalNo: Joi.string().optional(),
  tank: Joi.object().when("$isTankOrBattery", {
    is: Joi.boolean().valid(true).required(),
    then: Joi.object().keys({
      tankDetails: Joi.object().keys({
        tankManufacturer: Joi.string().max(70).required(),
        yearOfManufacture: Joi.number().max(4).required(),
        tankManufacturerSerialNo: Joi.string().max(50).required(),
        tankTypeAppNo: Joi.string().max(65).required(),
        tankCode: Joi.string().max(30).required(),
        specialProvisions: Joi.string().max(1024).optional(),
        tc2Details: Joi.object().keys({
          tc2Type: Joi.string().valid(...tc2Types).optional(),
          tc2IntermediateApprovalNo: Joi.string().max(70).optional(),
          tc2IntermediateExpiryDate: Joi.date().format("YYYY-MM-DD").optional()
        }).optional(),
        tc3Details: Joi.array().items(Joi.object().keys({
          tc3Type: Joi.string().valid(...tc3Types).optional(),
          tc3PeriodicNumber: Joi.string().max(75).optional(),
          tc3PeriodicExpiryDate: Joi.date().format("YYYY-MM-DD").optional()
        })).optional()
      }).required(),
      tankStatement: Joi.object().keys({
        substancesPermitted: Joi.string().required(),
        statement: Joi.string().max(1500).optional(),
        productListRefNo: Joi.string().optional(),
        productListUnNo: Joi.array().items(Joi.string()).optional(),
        productList: Joi.string().max(1500).optional()
      }).required()
    }).required(),
    otherwise: Joi.object().keys({
      tankDetails: Joi.object().forbidden(),
      tankStatement: Joi.object().forbidden()
    }).forbidden()
  })
});

import { ValidationResult, ObjectSchema } from '@hapi/joi';
import { Vehicle, Trailer } from '../../../@Types/TechRecords';
import { ERRORS, RECORD_COMPLETENESS_ENUM, VEHICLE_TYPE } from '../../assets';
import HTTPError from '../../models/HTTPError';
import {
  trlCoreMandatoryVehicleAttributes,
  psvHgvCarLgvMotoCoreMandatoryVehicleAttributes,
  carCoreMandatorySchema,
  hgvCoreMandatorySchema,
  lgvCoreMandatorySchema,
  motorcycleCoreMandatorySchema,
  psvCoreMandatorySchema,
  trlCoreMandatorySchema
} from './CoreMandatoryValidations';
import { psvNonCoreMandatorySchema, hgvNonCoreMandatorySchema, trlNonCoreMandatorySchema } from './NonCoreMandatoryValidations';

export function computeRecordCompleteness(vehicle: Vehicle): string {
  if (!vehicle.systemNumber) {
    throw new HTTPError(400, ERRORS.SYSTEM_NUMBER_GENERATION_FAILED);
  }

  const generalErrors = validateVehicleAttributes(vehicle)?.error;

  if (generalErrors) {
    console.log("general errors: ",generalErrors);
    return RECORD_COMPLETENESS_ENUM.SKELETON;
  }

  const mandatoryAttributesValidationResult = validateMandatoryTechRecordAttributes(vehicle);

  const isCoreMandatoryValid = !mandatoryAttributesValidationResult.coreValidationResult?.error;

  const isNonCoreMandatoryValid = !mandatoryAttributesValidationResult.nonCoreValidationResult?.error;

  if (isCoreMandatoryValid && isNonCoreMandatoryValid) {
    return RECORD_COMPLETENESS_ENUM.COMPLETE;
  } else if (isCoreMandatoryValid) {
    return RECORD_COMPLETENESS_ENUM.TESTABLE;
  } else {
    return RECORD_COMPLETENESS_ENUM.SKELETON;
  }
};

function validateVehicleAttributes(vehicle: Vehicle): ValidationResult | undefined {
  const vehicleType = vehicle.techRecord[0].vehicleType;

  const validationSchema = vehicleType === VEHICLE_TYPE.TRL
    ? trlCoreMandatoryVehicleAttributes
    : psvHgvCarLgvMotoCoreMandatoryVehicleAttributes

  if (!vehicleType) {
    return missingVehicleTypeValidationResult;
  } else if (!validationSchema) {
    return undefined;
  } else {
    const vehicleAttributes = {
      systemNumber: vehicle.systemNumber,
      vin: vehicle.vin,
      primaryVrm: vehicle.primaryVrm,
      trailerId: (vehicle as Trailer).trailerId ?? undefined
    };

    return validationSchema.validate(vehicleAttributes, { stripUnknown: true });
  }
};

function validateMandatoryTechRecordAttributes(vehicle: Vehicle) {
  const vehicleType = vehicle.techRecord[0].vehicleType as VEHICLE_TYPE;
  
  const coreMandatorySchema: ObjectSchema | undefined = coreMandatorySchemaMap.get(vehicleType);

  if (!coreMandatorySchema) {
    throw new HTTPError(400, ERRORS.VEHICLE_TYPE_ERROR);
  }

  const nonCoreMandatorySchema: ObjectSchema | undefined = nonCoreMandatorySchemaMap.get(vehicleType);

  const techRecord = vehicleType === VEHICLE_TYPE.TRL
    ? { ...vehicle.techRecord[0], primaryVrm: vehicle.primaryVrm }
    : vehicle.techRecord[0];

  return {
    coreValidationResult: coreMandatorySchema.validate(techRecord, {stripUnknown: true}),
    nonCoreValidationResult: nonCoreMandatorySchema?.validate(techRecord, {stripUnknown: true})
  };
};

const coreMandatorySchemaMap = new Map<VEHICLE_TYPE, any>([
  [VEHICLE_TYPE.PSV,        psvCoreMandatorySchema],
  [VEHICLE_TYPE.HGV,        hgvCoreMandatorySchema],
  [VEHICLE_TYPE.TRL,        trlCoreMandatorySchema],
  [VEHICLE_TYPE.LGV,        lgvCoreMandatorySchema],
  [VEHICLE_TYPE.CAR,        carCoreMandatorySchema],
  [VEHICLE_TYPE.MOTORCYCLE, motorcycleCoreMandatorySchema]
]);

const nonCoreMandatorySchemaMap = new Map<VEHICLE_TYPE, any>([
  [VEHICLE_TYPE.PSV, psvNonCoreMandatorySchema],
  [VEHICLE_TYPE.HGV, hgvNonCoreMandatorySchema],
  [VEHICLE_TYPE.TRL, trlNonCoreMandatorySchema]
]);

const missingVehicleTypeValidationResult: ValidationResult = {
  error: {
    name: 'ValidationError',
    isJoi: false,
    details: [],
    annotate: () => '',
    _object: null,
    message: 'Missing vehicle type'
  },
  value: null
};

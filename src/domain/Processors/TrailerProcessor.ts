import { VehicleProcessor } from "./VehicleProcessor";
import { Trailer, TrlTechRecord } from "../../../@Types/TechRecords";
import TechRecordsDAO from "../../models/TechRecordsDAO";
import { ErrorHandler } from "../../handlers/ErrorHandler";
import * as Enums from "../../assets/Enums";
import * as fromValidation from "../../utils/validations";
import { computeRecordCompleteness } from "../../utils/record-completeness/ComputeRecordCompleteness";
import * as validators from "../../utils/validations";

export class TrailerProcessor extends VehicleProcessor<Trailer> {
  constructor(vehicleObj: Trailer, techRecordDAO: TechRecordsDAO) {
    super(vehicleObj, techRecordDAO);
  }

  /* #region  Sync functions */
  protected validateTechRecordFields(newVehicle: TrlTechRecord, isCreate: boolean): string[] {
    const { trailerId } = this.vehicle;
    console.log("TRL validate tech record fields");
    const errors: string[] = [];
    const isTrailerIdValid = validators.validateTrailerId.validate(trailerId);
    if (isTrailerIdValid.error) {
      errors.push(Enums.ERRORS.INVALID_TRAILER_ID);
    }
    errors.push(...validators.validateHGVOrTrailer(newVehicle, this.validationOptions, isCreate));
    return errors;
  }

  protected mapFields(techRecord: TrlTechRecord): TrlTechRecord {
    console.log(`TRL populate fields`);
    const bodyDescription = techRecord.bodyType.description;
    const vehicleClassDescription = techRecord.vehicleClass.description;
    techRecord.bodyType.code = fromValidation.populateBodyTypeCode(
      bodyDescription
    );
    techRecord.vehicleClass.code = fromValidation.populateVehicleClassCode(
      vehicleClassDescription
    );
    return techRecord;
  }

  protected calculateRecordCompleteness(vehicle: Trailer): string {
    return computeRecordCompleteness(vehicle, vehicle.trailerId);
  }

  protected capitaliseGeneralVehicleAttributes(vehicle: Trailer) {
    vehicle = super.capitaliseGeneralVehicleAttributes(vehicle);
    vehicle.trailerId = vehicle.trailerId?.toUpperCase();
    return vehicle;
  }
  /* #endregion */

  /* #region  Async functions */
  protected async setNumberKey(): Promise<void> {
      this.vehicle.systemNumber = await this.numberGenerator.generateSystemNumber();
      this.vehicle.trailerId = await this.numberGenerator.generateTrailerId();
  }

  protected async validateVrmWithHistory(
    newTechRecord: Trailer,
    existingTechRecord: Trailer
  ) {
    let errors: string[] = [];
    const result = await super.validateVrmWithHistory(
      newTechRecord,
      existingTechRecord
    );
    errors.push(...result);
    const { trailerId } = newTechRecord;
    if (
      trailerId &&
      existingTechRecord.trailerId !== trailerId
    ) {
      const trailerIdRecords = await this.techRecordDAO.getBySearchTerm(
        trailerId,
        Enums.SEARCHCRITERIA.TRAILERID
      );
      if (trailerIdRecords.length && trailerIdRecords.length > 0) {
        errors.push(`TrailerId ${trailerId} already exists`);
        throw ErrorHandler.Error(400, errors);
      }
    }
    return errors;
  }

  protected updateVehicleIdentifiers(
    existingVehicle: Trailer,
    updatedVehicle: Trailer
  ): Trailer {
    const { trailerId } = updatedVehicle;
    updatedVehicle = super.updateVehicleIdentifiers(existingVehicle, updatedVehicle);
    if(!trailerId || existingVehicle.trailerId === trailerId) {
      return updatedVehicle;
    }
    const previousTrailerId = existingVehicle.trailerId;
    updatedVehicle.techRecord[0].reasonForCreation =
      `Trailer Id updated from ${previousTrailerId} to ${trailerId}. ` +
      updatedVehicle.techRecord[0].reasonForCreation;
    return updatedVehicle;
  }
  /* #endregion */
}

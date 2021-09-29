import { VehicleProcessor } from "./VehicleProcessor";
import { Motorcycle, MotorcycleTechRecord } from "../../../@Types/TechRecords";
import * as validators from "../../utils/validations";
import TechRecordsDAO from "../../models/TechRecordsDAO";

export class MotorcycleProcessor extends VehicleProcessor<Motorcycle> {
  constructor(vehicleObj: Motorcycle, techRecordDAO: TechRecordsDAO) {
    super(vehicleObj, techRecordDAO);
  }
  protected async setNumberKey(): Promise<void> {
    this.vehicle.systemNumber = await this.numberGenerator.generateSystemNumber();
  }

  protected validateTechRecordFields(
    newVehicle: MotorcycleTechRecord
  ): string[] {
    console.log("Motorcycle validate tech record fields");
    const validationResult = validators.motorcycleValidation.validate(
      newVehicle,
      this.validationOptions
    );
    return validators.handleValidationResult(validationResult);
  }

  protected mapFields(techRecord: MotorcycleTechRecord): MotorcycleTechRecord {
    console.log(`Motorcycle populate fields`);
    techRecord.vehicleClass.code = validators.populateVehicleClassCode(
      techRecord.vehicleClass.description
    );
    return techRecord;
  }
}

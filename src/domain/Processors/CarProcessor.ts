import { VehicleProcessor } from "./VehicleProcessor";
import { CarLgvTechRecord, Car } from "../../../@Types/TechRecords";
import * as validators from "../../utils/validations";
import TechRecordsDAO from "../../models/TechRecordsDAO";


export class CarProcessor extends VehicleProcessor<Car> {
  constructor(vehicleObj: Car, techRecordDAO: TechRecordsDAO) {
    super(vehicleObj, techRecordDAO);
  }

  protected async setNumberKey(): Promise<void> {
    this.vehicle.systemNumber = await this.numberGenerator.generateSystemNumber();
  }

  protected validateTechRecordFields(newVehicle: CarLgvTechRecord): string[] {
    console.log("Car validate tech record fields");
    const validationResult = validators.carValidation.validate(
      newVehicle,
      this.validationOptions
    );
    return validators.handleValidationResult(validationResult);
  }

  protected mapFields(techRecord: CarLgvTechRecord): CarLgvTechRecord {
    console.log(`Car populate fields`);
    if (techRecord.vehicleClass) {
      techRecord.vehicleClass.code = validators.populateVehicleClassCode(
        techRecord.vehicleClass.description
      );
    }
    return techRecord;
  }
}

import { VehicleProcessor } from "./VehicleProcessor";
import {
  CarLgvTechRecord,
  LightGoodsVehicle
} from "../../../@Types/TechRecords";
import * as validators from "../../utils/validations";
import TechRecordsDAO from "../../models/TechRecordsDAO";

export class LgvProcessor extends VehicleProcessor<LightGoodsVehicle> {
  constructor(vehicleObj: LightGoodsVehicle, techRecordDAO: TechRecordsDAO) {
    super(vehicleObj, techRecordDAO);
  }

  protected async setNumberKey(): Promise<void> {
    this.vehicle.systemNumber = await this.numberGenerator.generateSystemNumber();
  }

  protected validateTechRecordFields(newVehicle: CarLgvTechRecord): string[] {
    console.log("LGV validate tech record fields");
    const validationResult = validators.lgvValidation.validate(
      newVehicle,
      this.validationOptions
    );
    return validators.handleValidationResult(validationResult);
  }

  protected mapFields(techRecord: CarLgvTechRecord): CarLgvTechRecord {
    console.log(`LGV populate fields`);
    if (techRecord.vehicleClass) {
      techRecord.vehicleClass.code = validators.populateVehicleClassCode(
        techRecord.vehicleClass.description
      );
    }
    return techRecord;
  }
}

import { VehicleProcessor } from "./VehicleProcessor";
import {
  PublicServiceVehicle,
  PsvTechRecord
} from "../../../@Types/TechRecords";
import * as validators from "../../utils/validations";
import TechRecordsDAO from "../../models/TechRecordsDAO";

export class PsvProcessor extends VehicleProcessor<PublicServiceVehicle> {
  constructor(vehicleObj: PublicServiceVehicle, techRecordDAO: TechRecordsDAO) {
    super(vehicleObj, techRecordDAO);
  }
  protected async setNumberKey(): Promise<void> {
    this.vehicle.systemNumber = await this.numberGenerator.generateSystemNumber();
  }

  protected validateTechRecordFields(newVehicle: PsvTechRecord): string[] {
    console.log("PSV validate tech record fields");
    const validationResult = validators.psvValidation.validate(
      newVehicle,
      this.validationOptions
    );
    return validators.handleValidationResult(validationResult);
    // return psvValidation.validate(newVehicle, this.validationOptions);
  }

  protected mapFields(techRecord: PsvTechRecord): PsvTechRecord {
    console.log(`PSV populate fields`);
    techRecord.bodyType.code = validators.populateBodyTypeCode(
      techRecord.bodyType.description
    );
    techRecord.vehicleClass.code = validators.populateVehicleClassCode(
      techRecord.vehicleClass.description
    );
    techRecord.brakes.brakeCodeOriginal = techRecord.brakes.brakeCode.substring(
      techRecord.brakes.brakeCode.length - 3
    );
    techRecord.brakeCode = techRecord.brakes.brakeCode;
    return techRecord;
  }
}

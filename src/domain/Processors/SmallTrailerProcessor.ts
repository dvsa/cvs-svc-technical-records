import { VehicleProcessor } from "./VehicleProcessor";
import { CarLgvTechRecord, SmallTrailer } from "../../../@Types/TechRecords";
import * as validators from "../../utils/validations";
import TechRecordsDAO from "../../models/TechRecordsDAO";


export class SmallTrailerProcessor extends VehicleProcessor<SmallTrailer> {
  constructor(vehicleObj: SmallTrailer, techRecordDAO: TechRecordsDAO) {
    super(vehicleObj, techRecordDAO);
  }

  protected async setNumberKey(): Promise<void> {
    this.vehicle.systemNumber = await this.numberGenerator.generateSystemNumber();
    if(!this.vehicle.trailerId) {
      const newTrailerId = await this.numberGenerator.generateTNumber();
      this.vehicle.trailerId = newTrailerId;
      this.vehicle.primaryVrm = newTrailerId;
    }
  }

  protected validateTechRecordFields(newVehicle: CarLgvTechRecord): string[] {
    console.log("Small trailer validate tech record fields");

    const validationResult = validators.smallTrailerValidation.validate(newVehicle, this.validationOptions);

    return validators.handleValidationResult(validationResult);
  }

  protected mapFields(techRecord: CarLgvTechRecord): CarLgvTechRecord {
    console.log(`Small trailer populate fields`);

    if (techRecord.vehicleClass) {
      techRecord.vehicleClass.code = validators.populateVehicleClassCode(techRecord.vehicleClass.description);
    }

    return techRecord;
  }
}

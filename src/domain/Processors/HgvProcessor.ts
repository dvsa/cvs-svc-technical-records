import {VehicleProcessor} from "./VehicleProcessor";
import {HgvTechRecord, HeavyGoodsVehicle} from "../../../@Types/TechRecords";
import * as validators from "../../utils/validations";
import TechRecordsDAO from "../../models/TechRecordsDAO";

export class HgvProcessor extends VehicleProcessor<HeavyGoodsVehicle> {
  constructor(vehicleObj: HeavyGoodsVehicle, techRecordDAO: TechRecordsDAO) {
    super(vehicleObj, techRecordDAO);
  }
  protected async setNumberKey(): Promise<void> {
    this.vehicle.systemNumber = await this.numberGenerator.generateSystemNumber();
  }
  protected validateTechRecordFields(newVehicle: HgvTechRecord, isCreate: boolean): string[] {
    console.log("HGV validate tech record fields");
    return validators.validateHGVOrTrailer(newVehicle, this.validationOptions, isCreate);
  }

  protected mapFields(techRecord: HgvTechRecord): HgvTechRecord {
    console.log(`HGV populate fields`);
    techRecord.bodyType.code = validators.populateBodyTypeCode(techRecord.bodyType.description);
    techRecord.vehicleClass.code = validators.populateVehicleClassCode(techRecord.vehicleClass.description);
    return techRecord;
  }
}

import { ErrorHandler } from "../handlers/ErrorHandler";
import * as enums from "../assets/";
import {
  Car,
  HeavyGoodsVehicle,
  LightGoodsVehicle,
  Motorcycle,
  PublicServiceVehicle,
  SmallTrailer,
  Trailer,
  Vehicle,
} from "../../@Types/TechRecords";
import * as processors from "./Processors";
import TechRecordsDAO from "../models/TechRecordsDAO";
import { EU_VEHICLE_CATEGORY } from "../assets/";


export class VehicleFactory {
  public static generateVehicleInstance(
    vehicleObj: Vehicle,
    techRecordDAO: TechRecordsDAO
  ): processors.VehicleProcessor<Vehicle> {
    switch (vehicleObj.techRecord[0].vehicleType) {
      case enums.VEHICLE_TYPE.PSV:
        return new processors.PsvProcessor(vehicleObj as PublicServiceVehicle, techRecordDAO);
      case enums.VEHICLE_TYPE.HGV:
        return new processors.HgvProcessor(vehicleObj as HeavyGoodsVehicle, techRecordDAO);
      case enums.VEHICLE_TYPE.TRL:
        return vehicleObj.techRecord[0].euVehicleCategory === EU_VEHICLE_CATEGORY.O1 
          || vehicleObj.techRecord[0].euVehicleCategory === EU_VEHICLE_CATEGORY.O2
          ? new processors.SmallTrailerProcessor(vehicleObj as SmallTrailer, techRecordDAO)
          : new processors.TrailerProcessor(vehicleObj as Trailer, techRecordDAO);
      case enums.VEHICLE_TYPE.LGV:
        return new processors.LgvProcessor(vehicleObj as LightGoodsVehicle, techRecordDAO);
      case enums.VEHICLE_TYPE.CAR:
        return new processors.CarProcessor(vehicleObj as Car, techRecordDAO);
      case enums.VEHICLE_TYPE.MOTORCYCLE:
        return new processors.MotorcycleProcessor(vehicleObj as Motorcycle, techRecordDAO);
      default:
        throw ErrorHandler.Error(400, enums.ERRORS.INVALID_VEHICLE_TYPE);
    }
  }
}

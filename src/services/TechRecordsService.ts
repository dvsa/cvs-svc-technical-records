import { cloneDeep } from "lodash";
import { ISearchCriteria } from "../../@Types/ISearchCriteria";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import IMsUserDetails from "../../@Types/IUserDetails";
import { TechRecord, Vehicle } from "../../@Types/TechRecords";
import {
  EU_VEHICLE_CATEGORY,
  HTTPRESPONSE,
  SEARCHCRITERIA,
  STATUS,
} from "../assets/Enums";
import { VehicleFactory } from "../domain/VehicleFactory";
import { TechRecordsListHandler } from "../handlers/TechRecordsListHandler";
import { TechRecordStatusHandler } from "../handlers/TechRecordStatusHandler";
import HTTPError from "../models/HTTPError";
import HTTPResponse from "../models/HTTPResponse";
import TechRecordsDAO from "../models/TechRecordsDAO";

/**
 * Fetches the entire list of Technical Records from the database.
 * @returns Promise
 */

class TechRecordsService {
  private readonly techRecordsDAO: TechRecordsDAO;
  private readonly techRecordsListHandler: TechRecordsListHandler<Vehicle>;
  private readonly techRecordStatusHandler: TechRecordStatusHandler<Vehicle>;

  constructor(techRecordsDAO: TechRecordsDAO) {
    this.techRecordsDAO = techRecordsDAO;
    this.techRecordsListHandler = new TechRecordsListHandler(
      this.techRecordsDAO
    );
    this.techRecordStatusHandler = new TechRecordStatusHandler(
      this.techRecordsListHandler
    );
  }

  public getTechRecordsList(
    searchTerm: string,
    status: string,
    searchCriteria: ISearchCriteria = SEARCHCRITERIA.ALL
  ): Promise<Vehicle[]> {
    return this.techRecordsListHandler.getFormattedTechRecordsList(
      searchTerm,
      status,
      searchCriteria
    );
  }

  public async insertTechRecord(
    payload: Vehicle,
    msUserDetails: IMsUserDetails
  ) {
    try {
    const vehicle = VehicleFactory.generateVehicleInstance(
      payload,
      this.techRecordsDAO
    );
    return vehicle.createVehicle(msUserDetails);
    } catch(error) {
      console.error(error);
      throw new HTTPError(error.statusCode, error.body);
    }
  }

  public async updateTechRecord(
    techRecord: Vehicle,
    msUserDetails: IMsUserDetails,
    oldStatusCode?: STATUS
  ) {
    try {
      const vehicle = VehicleFactory.generateVehicleInstance(
        techRecord,
        this.techRecordsDAO
      );
      return await vehicle.updateVehicle(msUserDetails, oldStatusCode);
    } catch (error) {
      console.error(error);
      throw new HTTPError(error.statusCode, error.body);
    }
  }

  public async updateTechRecordStatusCode(
    systemNumber: string,
    newStatus: STATUS = STATUS.CURRENT,
    createdById: string,
    createdByName: string
  ) {
    const uniqueRecord = await this.techRecordStatusHandler.prepareTechRecordForStatusUpdate(
      systemNumber,
      newStatus,
      createdById,
      createdByName
    );
    try {
      const vehicle = VehicleFactory.generateVehicleInstance(
      uniqueRecord,
      this.techRecordsDAO
    );
      return vehicle.updateTechRecordStatusCode(uniqueRecord);
   } catch(error) {
    console.error(error);
    throw new HTTPError(error.statusCode, error.body);
   }
  }

  public async archiveTechRecordStatus(
    systemNumber: string,
    techRecordToUpdate: Vehicle,
    userDetails: IMsUserDetails,
    reasonForArchiving: string
  ) {
    const vehicle = VehicleFactory.generateVehicleInstance(
      techRecordToUpdate,
      this.techRecordsDAO
    );
    return vehicle.archiveTechRecordStatus(systemNumber,techRecordToUpdate,userDetails,reasonForArchiving);
  }

  public async updateEuVehicleCategory(
    systemNumber: string,
    newEuVehicleCategory: EU_VEHICLE_CATEGORY,
    createdById: string,
    createByName: string
  ): Promise<HTTPResponse | HTTPError> {
    const techRecordWrapper = (
      await this.getTechRecordsList(
        systemNumber,
        STATUS.ALL,
        SEARCHCRITERIA.SYSTEM_NUMBER
      )
    )[0];

    const vehicle = VehicleFactory.generateVehicleInstance(
    techRecordWrapper,
    this.techRecordsDAO
    );

    return vehicle.updateEuVehicleCategory(systemNumber, newEuVehicleCategory, { msOid: createdById, msUser: createByName });
  }

  public async addProvisionalTechRecord(
    provisionalVehicle: Vehicle,
    msUserDetails: IMsUserDetails
  ) {
    const vehicle = VehicleFactory.generateVehicleInstance(
      provisionalVehicle,
      this.techRecordsDAO
    );
    return vehicle.addNewProvisionalRecord(msUserDetails);
  }

  public insertTechRecordsList(techRecordItems: ITechRecordWrapper[]) {
    return this.techRecordsDAO
      .createMultiple(techRecordItems)
      .then((data) => {
        if (data.UnprocessedItems) {
          return data.UnprocessedItems;
        }
      })
      .catch((error: any) => {
        console.error(error);
        throw new HTTPError(500, HTTPRESPONSE.INTERNAL_SERVER_ERROR);
      });
  }

  public deleteTechRecordsList(techRecordItemKeys: string[][]) {
    return this.techRecordsDAO
      .deleteMultiple(techRecordItemKeys)
      .then((data) => {
        if (data.UnprocessedItems) {
          return data.UnprocessedItems;
        }
      })
      .catch((error: any) => {
        console.error(error);
        throw new HTTPError(500, HTTPRESPONSE.INTERNAL_SERVER_ERROR);
      });
  }

  public updateVin(vehicle: Vehicle, newVin: string) {
    const vehicleClone = cloneDeep(vehicle);

    const oldVehicle: Vehicle = { ...vehicleClone, techRecord: [] };
    const newVehicle: Vehicle = {
      ...vehicleClone,
      vin: newVin,
      techRecord: [],
    };
    let provisional: TechRecord | undefined;

    vehicleClone.techRecord.forEach((record) => {
      switch (record.statusCode) {
        case STATUS.PROVISIONAL:
          provisional = { ...record };
          break;
        case STATUS.CURRENT:
          newVehicle.techRecord = [{ ...record }];
          oldVehicle.techRecord.push({ ...record, statusCode: "archived" });
          break;
        case STATUS.ARCHIVED:
          oldVehicle.techRecord.push({ ...record });
          break;
        default:
          break;
      }
    });

    if (!newVehicle.techRecord.length && provisional) {
      newVehicle.techRecord = [{ ...provisional }];
      oldVehicle.techRecord.push({ ...provisional, statusCode: "archived" });
    }

    return { oldVehicle, newVehicle };
  }
}

export default TechRecordsService;

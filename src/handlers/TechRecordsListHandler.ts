import TechRecordsDAO from "../models/TechRecordsDAO";
import { LegacyKeyStructure, LegacyTechRecord } from "../../@Types/LegacyTechRecord";
import { ISearchCriteria } from "../../@Types/ISearchCriteria";
import { HTTPRESPONSE, SEARCHCRITERIA, STATUS } from "../assets/Enums";
import HTTPError from "../models/HTTPError";
import { cloneDeep } from "lodash";
import { TechRecord, Vehicle } from "../../@Types/TechRecords";
import { ErrorHandler } from "./ErrorHandler";
import { IFlatTechRecordWrapper } from "../../@Types/IFlatTechRecordWrapper";

export class TechRecordsListHandler<T extends Vehicle> {
  private readonly techRecordsDAO: TechRecordsDAO;

  constructor(techRecordsDAO: TechRecordsDAO) {
    this.techRecordsDAO = techRecordsDAO;
  }

  /* #region  Public functions */
  public async getFormattedTechRecordsList(
    searchTerm: string,
    status: string,
    searchCriteria: ISearchCriteria = SEARCHCRITERIA.ALL,
    format?: string
  ): Promise<T[]> {
    try {
      // Formatting the object for lambda function
      let techRecordItems = await this.getTechRecordList(
        searchTerm,
        status,
        searchCriteria,
        format
      );
      techRecordItems = this.formatTechRecordItemsForResponse(techRecordItems);
      return techRecordItems;
    } catch (error) {
      if (!(error instanceof HTTPError)) {
        console.error(error);
        error.statusCode = 500;
        error.body = HTTPRESPONSE.INTERNAL_SERVER_ERROR;
      }
      throw ErrorHandler.Error(error.statusCode, error.body);
    }
  }

  public async getTechRecordList(
    searchTerm: string,
    status: string,
    searchCriteria: ISearchCriteria = SEARCHCRITERIA.ALL,
    format?: string
  ): Promise<T[]> {
      const data = await this.techRecordsDAO.getBySearchTerm(
          searchTerm,
          searchCriteria
      );
      if (data.length === 0) {
        throw new HTTPError(404, HTTPRESPONSE.RESOURCE_NOT_FOUND);
      }
      let techRecordItems: T[] = data as unknown as T[];

      if (format && format === "FLAT") {
        techRecordItems = this.flatToLegacy(techRecordItems as unknown as IFlatTechRecordWrapper[]);
      }

      // Formatting the object for lambda function
      if (status !== STATUS.ALL) {
        techRecordItems = this.filterTechRecordsByStatus(techRecordItems, status);
      }
      return techRecordItems;
  }
  public nestItem = (record: LegacyKeyStructure, key: string, value: string | number | boolean | string[], position: number) => {
    const idx = key.indexOf("_", position);
    if (idx === -1) {
      record[key.substring(position)] = value;
      return;
    }
    const realKey = key.substring(position, idx);
    const isArray = !isNaN(parseInt(key[idx + 1], 10));
    if (!record[realKey.toString()]) {
      if (isArray) {
        record[realKey.toString()] = [];
      } else {
        record[realKey.toString()] = {};
      }
    }
    this.nestItem(record[realKey.toString()] as LegacyKeyStructure, key, value, idx + 1);
    return record;
  }

  public flatToLegacy(items: IFlatTechRecordWrapper[]) {
    const searchResult: T[] = [];
    // Sort response from DB into descending createdTimestamp order
    items.sort((a,b) => {
      return new Date(a.createdTimestamp).getTime() - new Date(b.createdTimestamp).getTime();
    });

    items.forEach((item) => {
      const vehicle = {} as LegacyTechRecord;
      vehicle.techRecord = [];
      const legacyRecord = {} as LegacyKeyStructure;

      for (const [key, value] of Object.entries(item)) {
        if (key.indexOf("_") === -1 && !vehicle[key]) {
          vehicle[key] = value;
          continue;
        }
        this.nestItem(legacyRecord, key, value, 0);
      }

      vehicle.techRecord.push(legacyRecord);

      // If multiple vehicles returned i.e. via partialVin search, then add to correct techRecord array...
      const vehicleIndex = searchResult.findIndex((result) => result.systemNumber === vehicle.systemNumber);

      if (vehicleIndex) {
        searchResult[vehicleIndex].techRecord.push(vehicle.techRecord as unknown as TechRecord);
      } else {
        searchResult.push(vehicle as unknown as T);
      }
    });
    return searchResult;
  }
  public formatTechRecordItemForResponse(techRecordItem: T) {
    // Adding primary and secondary VRMs in the same array
    const vrms = [];
    if (techRecordItem.primaryVrm) {
      vrms.push({ vrm: techRecordItem.primaryVrm, isPrimary: true });
    }
    if (techRecordItem.secondaryVrms) {
      for (const secondaryVrm of techRecordItem.secondaryVrms) {
        vrms.push({ vrm: secondaryVrm, isPrimary: false });
      }
    }
    Object.assign(techRecordItem, {
      vrms
    });
    // Cleaning up unneeded properties
    delete techRecordItem.primaryVrm; // No longer needed
    delete techRecordItem.secondaryVrms; // No longer needed
    delete techRecordItem.partialVin; // No longer needed
    techRecordItem.techRecord.forEach((techRecord: any) => {
      if (
        techRecord.euroStandard !== undefined &&
        techRecord.euroStandard !== null
      ) {
        techRecord.euroStandard = techRecord.euroStandard.toString();
      }
    });

    return techRecordItem;
  }
  /* #endregion */

  /* #region  Private functions */
  private filterTechRecordsByStatus(techRecordItems: T[], status: string): T[] {
   return techRecordItems.map((item) => this.filterTechRecordsForIndividualVehicleByStatus(item, status));
  }

  private filterTechRecordsForIndividualVehicleByStatus(
    techRecordItem: T,
    status: string
  ): T {
    const originalTechRecordItem = cloneDeep(techRecordItem);
    let provisionalOverCurrent = false;
    if (status === STATUS.PROVISIONAL_OVER_CURRENT) {
      provisionalOverCurrent = true;
      status = STATUS.PROVISIONAL;
    }

    techRecordItem.techRecord = techRecordItem.techRecord.filter(
      (techRecord: any) => {
        return techRecord.statusCode === status;
      }
    );

    const { length } = originalTechRecordItem.techRecord;
    const { statusCode } = originalTechRecordItem.techRecord[0];

    if (
      provisionalOverCurrent &&
      length === 1 &&
      techRecordItem.techRecord.length > 0 &&
      (statusCode === STATUS.CURRENT || statusCode === STATUS.PROVISIONAL)
    ) {
      return techRecordItem;
    }

    if (
      provisionalOverCurrent &&
      (length === techRecordItem.techRecord.length ||
        0 === techRecordItem.techRecord.length)
    ) {
      techRecordItem = this.filterTechRecordsForIndividualVehicleByStatus(
        originalTechRecordItem,
        STATUS.CURRENT
      );
    }

    if (techRecordItem.techRecord.length <= 0) {
      throw new HTTPError(404, HTTPRESPONSE.RESOURCE_NOT_FOUND);
    }

    return techRecordItem;
  }

  private formatTechRecordItemsForResponse(techRecordItems: T[]) {
    const recordsToReturn = [];
    return techRecordItems.map(this.formatTechRecordItemForResponse);
    // for (let techRecordItem of techRecordItems) {
    //   techRecordItem = this.formatTechRecordItemForResponse(techRecordItem);
    //   recordsToReturn.push(techRecordItem);
    // }
    // return recordsToReturn;
  }
  /* #endregion */
}

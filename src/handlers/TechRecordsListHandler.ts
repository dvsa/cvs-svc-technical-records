import TechRecordsDAO from "../models/TechRecordsDAO";
import { ISearchCriteria } from "../../@Types/ISearchCriteria";
import { HTTPRESPONSE, SEARCHCRITERIA, STATUS } from "../assets/Enums";
import HTTPError from "../models/HTTPError";
import { cloneDeep } from "lodash";
import { Vehicle } from "../../@Types/TechRecords";
import { ErrorHandler } from "./ErrorHandler";

export class TechRecordsListHandler<T extends Vehicle> {
  private readonly techRecordsDAO: TechRecordsDAO;

  constructor(techRecordsDAO: TechRecordsDAO) {
    this.techRecordsDAO = techRecordsDAO;
  }

  /* #region  Public functions */
  public async getFormattedTechRecordsList(
    searchTerm: string,
    status: string,
    searchCriteria: ISearchCriteria = SEARCHCRITERIA.ALL
  ): Promise<T[]> {
    try {
      // Formatting the object for lambda function
      let techRecordItems = await this.getTechRecordList(
        searchTerm,
        status,
        searchCriteria
      );

      if (techRecordItems.length === 0) {
        throw new HTTPError(404, HTTPRESPONSE.RESOURCE_NOT_FOUND);
      }

      if (searchCriteria === SEARCHCRITERIA.SYSTEM_NUMBER && this.multipleRecordsWithSameSystemNumber(techRecordItems)) {
        techRecordItems = this.mergeRecordsWithSameSystemNumber(techRecordItems);
      }

      return techRecordItems.map(this.formatTechRecordItemForResponse);
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
    searchCriteria: ISearchCriteria = SEARCHCRITERIA.ALL
  ): Promise<T[]> {
      const data = await this.techRecordsDAO.getBySearchTerm(
          searchTerm,
          searchCriteria
      );
      if (data.length === 0) {
        throw new HTTPError(404, HTTPRESPONSE.RESOURCE_NOT_FOUND);
      }
      // Formatting the object for lambda function
      let techRecordItems: T[] = data as unknown as T[];
      if (status !== STATUS.ALL) {
        techRecordItems = this.filterTechRecordsByStatus(techRecordItems, status);
      }
      return techRecordItems;
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
   return techRecordItems.map((item) => this.filterTechRecordsForIndividualVehicleByStatus(item, status)).filter((item) => item.techRecord.length > 0);
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

    return techRecordItem;
  }

  private multipleRecordsWithSameSystemNumber(techRecordItems: T[]): boolean {
    const uniqueSystemNumbers = new Set(techRecordItems.map((item) => item.systemNumber));
    return uniqueSystemNumbers.size !== techRecordItems.length;
  }

  private mergeRecordsWithSameSystemNumber(techRecordItems: T[]) {
    const recordsToReturn: T[] = [];

    techRecordItems.forEach((vehicle) => {
      vehicle.techRecord.forEach((object, index) => {
        vehicle.techRecord[index].historicVin = vehicle.vin;
      });

      const existingRecordIndex = recordsToReturn.findIndex((record) => record.systemNumber === vehicle.systemNumber);

      if (existingRecordIndex === -1) {
        return recordsToReturn.push(vehicle);
      }

      const existingRecord = recordsToReturn[existingRecordIndex];

      const existingRecordCreatedAt = Math.max(...existingRecord.techRecord.map((techRecordObject) => new Date(techRecordObject.createdAt).getTime()));
      const itemCreatedAt =  Math.max(...vehicle.techRecord.map((techRecordObject) => new Date(techRecordObject.createdAt).getTime()));

      if (itemCreatedAt < existingRecordCreatedAt) {
        return recordsToReturn[existingRecordIndex].techRecord.push(...vehicle.techRecord);
      }

      const oldItems = cloneDeep(existingRecord);
      recordsToReturn[existingRecordIndex] = cloneDeep(vehicle);
      recordsToReturn[existingRecordIndex].techRecord.push(...oldItems.techRecord);
    });

    return recordsToReturn;
  }
  /* #endregion */
}

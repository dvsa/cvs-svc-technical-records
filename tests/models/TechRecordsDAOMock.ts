export default class TechRecordsDAOMock {
  public static techRecordsMock: any;
  public static unprocessedItems: any;
  public static numberOfrecords: number | null;
  public static numberOfScannedRecords: number | null;
  public static isDatabaseOn: boolean;

  constructor() {
    TechRecordsDAOMock.techRecordsMock = null;
    TechRecordsDAOMock.unprocessedItems = null;
    TechRecordsDAOMock.numberOfrecords = null;
    TechRecordsDAOMock.numberOfScannedRecords = null;
    TechRecordsDAOMock.isDatabaseOn = true;
  }

  public getAll() {
    const responseObject = {
      Items: TechRecordsDAOMock.techRecordsMock,
      Count: TechRecordsDAOMock.numberOfrecords,
      ScannedCount: TechRecordsDAOMock.numberOfScannedRecords
    };

    if (!TechRecordsDAOMock.isDatabaseOn) { return Promise.reject(responseObject); }

    return Promise.resolve(responseObject);
  }

  public getBySearchTerm(searchTerm: string) {
    const responseObject = {
      Items: TechRecordsDAOMock.techRecordsMock,
      Count: TechRecordsDAOMock.numberOfrecords,
      ScannedCount: TechRecordsDAOMock.numberOfScannedRecords
    };

    if (!TechRecordsDAOMock.isDatabaseOn) { return Promise.reject(responseObject); }

    return Promise.resolve(responseObject);
  }

  public createMultiple() {
    const responseObject = { UnprocessedItems: TechRecordsDAOMock.unprocessedItems };

    if (!TechRecordsDAOMock.isDatabaseOn) { return Promise.reject(responseObject); }

    return Promise.resolve(responseObject);
  }

  public deleteMultiple() {
    const responseObject = { UnprocessedItems: TechRecordsDAOMock.unprocessedItems };

    if (!TechRecordsDAOMock.isDatabaseOn) { return Promise.reject(responseObject); }

    return Promise.resolve(responseObject);
  }
}

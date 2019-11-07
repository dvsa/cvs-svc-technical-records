import HTTPError from "../models/HTTPError";
import TechRecordsDAO from "../models/TechRecordsDAO";
import ITechRecord from "../../@Types/ITechRecord";
import {ManagedUpload, Metadata} from "aws-sdk/clients/s3";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {HTTPRESPONSE, STATUS, UPDATE_TYPE} from "../assets/Enums";
import HTTPResponse from "../models/HTTPResponse";
import {validatePayload} from "../utils/AdrValidation";
import S3BucketService from "./S3BucketService";
import S3 = require("aws-sdk/clients/s3");

/**
 * Fetches the entire list of Technical Records from the database.
 * @returns Promise
 */

class TechRecordsService {
  private techRecordsDAO: TechRecordsDAO;
  private s3BucketService: S3BucketService;

  constructor(techRecordsDAO: TechRecordsDAO) {
    this.techRecordsDAO = techRecordsDAO;
    this.s3BucketService = new S3BucketService(new S3());
  }

  public getTechRecordsList(searchTerm: string, status: string) {
    return this.techRecordsDAO.getBySearchTerm(searchTerm)
      .then((data: any) => {
        if (data.Count === 0) {
          throw new HTTPError(404, HTTPRESPONSE.RESOURCE_NOT_FOUND);
        }

        if (data.Count > 1) {
          throw new HTTPError(422, HTTPRESPONSE.MORE_THAN_ONE_MATCH);
        }

        // Formatting the object for lambda function
        let techRecordItem = data.Items[0];
        if (status !== STATUS.ALL) {
          techRecordItem = this.filterTechRecordsByStatus(techRecordItem, status);
        }
        techRecordItem = this.formatTechRecordItemForResponse(techRecordItem);

        return techRecordItem;
      })
      .catch((error: any) => {
        if (!(error instanceof HTTPError)) {
          console.error(error);
          error.statusCode = 500;
          error.body = HTTPRESPONSE.INTERNAL_SERVER_ERROR;
        }
        throw new HTTPError(error.statusCode, error.body);
      });
  }

  private filterTechRecordsByStatus(techRecordItem: ITechRecordWrapper, status: string) {
    const originalTechRecordItem = JSON.parse(JSON.stringify(techRecordItem));
    let provisionalOverCurrent = false;
    if (status === STATUS.PROVISIONAL_OVER_CURRENT) {
      provisionalOverCurrent = true;
      status = STATUS.PROVISIONAL;
    }

    techRecordItem.techRecord = techRecordItem.techRecord
      .filter((techRecord: any) => {
        return techRecord.statusCode === status;
      });

    const {length} = originalTechRecordItem.techRecord;
    const {statusCode} = originalTechRecordItem.techRecord[0];

    if (provisionalOverCurrent && length === 1 && techRecordItem.techRecord.length > 0 && (statusCode === STATUS.CURRENT || statusCode === STATUS.PROVISIONAL)) {
      return techRecordItem;
    }

    if (provisionalOverCurrent && ((length === techRecordItem.techRecord.length) || (0 === techRecordItem.techRecord.length))) {
      techRecordItem = this.filterTechRecordsByStatus(originalTechRecordItem, STATUS.CURRENT);
    }

    if (techRecordItem.techRecord.length <= 0) {
      throw new HTTPError(404, HTTPRESPONSE.RESOURCE_NOT_FOUND);
    }

    return techRecordItem;
  }

  public formatTechRecordItemForResponse(techRecordItem: ITechRecordWrapper) {
    // Adding primary and secondary VRMs in the same array
    const vrms = [{vrm: techRecordItem.primaryVrm, isPrimary: true}];
    if (techRecordItem.secondaryVrms) {
      for (const secondaryVrm of techRecordItem.secondaryVrms) {
        vrms.push({vrm: secondaryVrm, isPrimary: false});
      }
    }
    Object.assign(techRecordItem, {
      vrms
    });
    // Cleaning up unneeded properties
    delete techRecordItem.primaryVrm; // No longer needed
    delete techRecordItem.secondaryVrms; // No longer needed
    delete techRecordItem.partialVin; // No longer needed

    techRecordItem.techRecord.forEach((techRecord) => {
      if (techRecord.euroStandard !== undefined && techRecord.euroStandard !== null) {
        techRecord.euroStandard = techRecord.euroStandard.toString();
      }
    });

    return techRecordItem;
  }

  public insertTechRecord(techRecord: ITechRecordWrapper) {
    return this.techRecordsDAO.createSingle(techRecord)
      .then((data: any) => {
        return data;
      })
      .catch((error: any) => {
        throw new HTTPError(error.statusCode, error.message);
      });
  }

  public updateTechRecord(techRecord: ITechRecordWrapper, msUserDetails: any, file?: string) {
    if (file) {
      return this.uploadFile(file)
        .then((uploadedData: any) => {
          console.log("AFTER UPLOAD", uploadedData);
          return this.createAndArchiveTechRecord(techRecord, msUserDetails)
            .then((data: ITechRecordWrapper) => {
              return this.techRecordsDAO.updateSingle(data)
                .then((updatedData: any) => {
                  return this.formatTechRecordItemForResponse(updatedData.Attributes);
                })
                .catch((error: any) => {
                  throw new HTTPError(error.statusCode, error.message);
                });
            });
        })
        .catch((error: any) => {
          console.log("EROARE", error);
          throw new HTTPError(error.statusCode, error.body);
        });
    } else {
      return this.createAndArchiveTechRecord(techRecord, msUserDetails)
        .then((data: ITechRecordWrapper) => {
          return this.techRecordsDAO.updateSingle(data)
            .then((updatedData: any) => {
              return this.formatTechRecordItemForResponse(updatedData.Attributes);
            })
            .catch((error: any) => {
              throw new HTTPError(error.statusCode, error.message);
            });
        })
        .catch((error: any) => {
          console.log("EROARE", error);
          throw new HTTPError(error.statusCode, error.body);
        });
    }
  }

  private createAndArchiveTechRecord(techRecord: ITechRecordWrapper, msUserDetails: any) {
    return this.getTechRecordsList(techRecord.vin, STATUS.ALL)
      .then((data: ITechRecordWrapper) => {
        const isAdrValid = validatePayload(techRecord.techRecord[0]);
        if (isAdrValid.error) {
          throw new HTTPError(500, isAdrValid.error.details);
        }
        const oldTechRec = this.getTechRecordToArchive(data);
        oldTechRec.statusCode = STATUS.ARCHIVED;
        const newRecord = JSON.parse(JSON.stringify(oldTechRec));
        newRecord.statusCode = STATUS.CURRENT;
        Object.assign(newRecord, techRecord.techRecord[0]);
        this.setAuditDetails(newRecord, oldTechRec, msUserDetails);
        data.techRecord.push(newRecord);
        return data;
      })
      .catch((error: any) => {
        throw new HTTPError(error.statusCode, error.body);
      });
  }

  private getTechRecordToArchive(techRecord: ITechRecordWrapper) {
    let currentTechRecord = null;
    let provisionalTechRecord = null;
    for (const record of techRecord.techRecord) {
      if (record.statusCode === STATUS.CURRENT) {
        currentTechRecord = record;
        break;
      } else if (record.statusCode === STATUS.PROVISIONAL) {
        provisionalTechRecord = record;
      }
    }
    if (currentTechRecord) {
      return currentTechRecord;
    } else if (provisionalTechRecord) {
      return provisionalTechRecord;
    } else {
      techRecord.techRecord.sort((a, b) => {
        return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf();
      });
      return techRecord.techRecord[0];
    }
  }

  private setAuditDetails(newTechRecord: ITechRecord, oldTechRecord: ITechRecord, msUserDetails: any) {
    const date = new Date().toISOString();
    newTechRecord.createdAt = date;
    newTechRecord.createdByName = msUserDetails.msUser;
    newTechRecord.createdById = msUserDetails.msOid;
    delete newTechRecord.lastUpdatedAt;
    delete newTechRecord.lastUpdatedById;
    delete newTechRecord.lastUpdatedByName;

    oldTechRecord.lastUpdatedAt = date;
    oldTechRecord.lastUpdatedByName = msUserDetails.msUser;
    oldTechRecord.lastUpdatedById = msUserDetails.msOid;
    oldTechRecord.updateType = UPDATE_TYPE.ADR;
  }

  public uploadFile(base64String: any): Promise<ManagedUpload.SendData> {
    const buffer: Buffer = Buffer.from(base64String, "base64");
    const metadata: Metadata = {
      "file-size": buffer.byteLength.toString(),
      "file-format": "pdf"
    };
    console.log("BUCKET NAME", process.env.BUCKET);
    return this.s3BucketService.upload(`cvs-adr-pdfs-nonprod`, `testing-${Date.now()}.pdf`, buffer, metadata);
  }

  public insertTechRecordsList(techRecordItems: ITechRecordWrapper[]) {
    return this.techRecordsDAO.createMultiple(techRecordItems)
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
    return this.techRecordsDAO.deleteMultiple(techRecordItemKeys)
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
}

export default TechRecordsService;

import HTTPError from "../models/HTTPError";
import TechRecordsDAO from "../models/TechRecordsDAO";
import ITechRecord from "../../@Types/ITechRecord";
import {ManagedUpload, Metadata} from "aws-sdk/clients/s3";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import {HTTPRESPONSE, STATUS, UPDATE_TYPE} from "../assets/Enums";
import * as _ from "lodash";
import * as uuid from "uuid";
import {validatePayload} from "../utils/PayloadValidation";
import S3BucketService from "./S3BucketService";
import S3 = require("aws-sdk/clients/s3");

/**
 * Fetches the entire list of Technical Records from the database.
 * @returns Promise
 */

class TechRecordsService {
  private techRecordsDAO: TechRecordsDAO;
  private s3BucketService: S3BucketService;

  constructor(techRecordsDAO: TechRecordsDAO, s3BucketService: S3BucketService) {
    this.techRecordsDAO = techRecordsDAO;
    this.s3BucketService = s3BucketService;
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
      if (techRecord.adrDetails) {
        if (techRecord.adrDetails.documents) {
          techRecord.adrDetails.documents = techRecord.adrDetails.documents.map((document: string) => {
            const filenameParts = document.split("/");
            if (filenameParts.length > 1) {
              return filenameParts[1];
            } else {
              return filenameParts[0];
            }
          });
        } else {
          techRecord.adrDetails.documents = [];
        }
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

  public updateTechRecord(techRecord: ITechRecordWrapper, msUserDetails: any, files?: string[]) {
    if (files && files.length) {
      const promises = [];
      for (const file of files) {
        promises.push(this.uploadFile(file, techRecord.vin));
      }
      return Promise.all(promises)
        .then((uploadedData: ManagedUpload.SendData[]) => {
          const documents: string[] = [];
          if (uploadedData && uploadedData.length) {
            for (const uploaded of uploadedData) {
              const filename = uploaded.Key.split("/")[1];
              documents.push(filename);
            }
          } else {
            throw new HTTPError(500, HTTPRESPONSE.S3_ERROR);
          }
          return this.manageUpdateLogic(techRecord, msUserDetails, documents);
        })
        .catch((error: any) => {
          throw new HTTPError(500, HTTPRESPONSE.S3_ERROR);
        });
    } else {
      return this.manageUpdateLogic(techRecord, msUserDetails);
    }
  }

  private manageUpdateLogic(techRecord: ITechRecordWrapper, msUserDetails: any, documents?: string[]) {
    return this.createAndArchiveTechRecord(techRecord, msUserDetails, documents)
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
        throw new HTTPError(error.statusCode, error.body);
      });
  }

  private createAndArchiveTechRecord(techRecord: ITechRecordWrapper, msUserDetails: any, documents?: string[]) {
    const isAdrValid = validatePayload(techRecord.techRecord[0]);
    if (isAdrValid.error) {
      throw new HTTPError(500, isAdrValid.error.details);
    }
    return this.getTechRecordsList(techRecord.vin, STATUS.ALL)
      .then((data: ITechRecordWrapper) => {
        const oldTechRec = this.getTechRecordToArchive(data);
        oldTechRec.statusCode = STATUS.ARCHIVED;
        const newRecord: any = _.cloneDeep(oldTechRec);
        newRecord.statusCode = STATUS.CURRENT;
        _.merge(newRecord, techRecord.techRecord[0]);
        if (techRecord.techRecord[0].adrDetails && techRecord.techRecord[0].adrDetails.documents) {
          newRecord.adrDetails.documents = techRecord.techRecord[0].adrDetails.documents;
        }
        if (documents && documents.length) {
          if (newRecord.adrDetails) {
            if (newRecord.adrDetails.documents) {
              newRecord.adrDetails.documents = newRecord.adrDetails.documents.concat(documents);
            } else {
              newRecord.adrDetails.documents = documents;
            }
          }
        }
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

  public uploadFile(file: string, vin: string): Promise<ManagedUpload.SendData> {
    const buffer: Buffer = Buffer.from(file, "base64");
    const metadata: Metadata = {
      "vin": vin,
      "file-size": buffer.byteLength.toString(),
      "file-format": "pdf"
    };
    return this.s3BucketService.upload(`cvs-${process.env.BUCKET}-adr-pdfs`, `${uuid.v4()}.pdf`, buffer, metadata);
  }

  public downloadFile(filename: string) {
    return this.s3BucketService.download(`cvs-${process.env.BUCKET}-adr-pdfs`, filename)
      .then((result: S3.Types.GetObjectOutput) => {
        return result.Body!.toString("base64");
      })
      .catch((error: any) => {
        console.error(error);
        throw new HTTPError(500, HTTPRESPONSE.S3_DOWNLOAD_ERROR);
      });
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

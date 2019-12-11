import Configuration from "../utils/Configuration";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import QueryInput = DocumentClient.QueryInput;
import {SEARCHCRITERIA} from "../assets/Enums";
import {ISearchCriteria} from "../../@Types/ISearchCriteria";

const dbConfig = Configuration.getInstance().getDynamoDBConfig();
/* tslint:disable */
let AWS: { DynamoDB: { DocumentClient: new (arg0: any) => DocumentClient; }; };
if (process.env._X_AMZN_TRACE_ID) {
  AWS = require("aws-xray-sdk").captureAWS(require("aws-sdk"));
} else {
  console.log("Serverless Offline detected; skipping AWS X-Ray setup")
  AWS = require("aws-sdk");
}
/* tslint:enable */
const dbClient = new AWS.DynamoDB.DocumentClient(dbConfig.params);

class TechRecordsDAO {
  private readonly tableName: string;

  constructor() {
    this.tableName = dbConfig.table;
  }

  public getBySearchTerm(searchTerm: string, searchCriteria: ISearchCriteria) {
    const query: QueryInput = {
      TableName: this.tableName,
      KeyConditionExpression: "",
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {}
    };

    if (isVinSearch(searchTerm, searchCriteria)) { // Query for a full VIN
      // The partial VIN is a primary index, and is always required
      Object.assign(query.ExpressionAttributeValues, {
        ":vin": searchTerm,
        ":partialVin": searchTerm.substring(searchTerm.length - 6)
      });

      Object.assign(query.ExpressionAttributeNames, {
        "#vin": "vin",
        "#partialVin": "partialVin"
      });

      // And create the query
      query.KeyConditionExpression = "#partialVin = :partialVin AND #vin = :vin";
    } else if (isTrailerSearch(searchTerm, searchCriteria)) { // Query for a Trailer ID
      Object.assign(query, { IndexName: "TrailerIdIndex" });

      Object.assign(query.ExpressionAttributeValues, {
        ":trailerId": searchTerm
      });
      Object.assign(query.ExpressionAttributeNames, {
        "#trailerId": "trailerId"
      });
      query.KeyConditionExpression = "#trailerId = :trailerId";
    } else if (isPartialVinSearch(searchTerm, searchCriteria)) { // Query for a partial VIN
      Object.assign(query.ExpressionAttributeValues, {
        ":partialVin": searchTerm
      });

      Object.assign(query.ExpressionAttributeNames, {
        "#partialVin": "partialVin"
      });
      query.KeyConditionExpression = "#partialVin = :partialVin";
    } else if (isVrmSearch(searchTerm, searchCriteria)) { // Query for a VRM
      // If we are queried a VRM, we need to specify we are using the VRM index
      Object.assign(query, { IndexName: "VRMIndex" });

      Object.assign(query.ExpressionAttributeValues, {
        ":vrm": searchTerm
      });

      Object.assign(query.ExpressionAttributeNames, {
        "#vrm": "primaryVrm"
      });

      query.KeyConditionExpression = "#vrm = :vrm";
    }
    return dbClient.query(query).promise();
  }

  public createSingle(techRecord: ITechRecordWrapper) {
    const query = {
      TableName: this.tableName,
      Item: techRecord,
      ConditionExpression: "vin <> :vin AND partialVin <> :partialVin",
      ExpressionAttributeValues: {
        ":vin": techRecord.vin,
        ":partialVin": techRecord.partialVin
      }
    };
    return dbClient.put(query).promise();
  }

  public updateSingle(techRecord: ITechRecordWrapper) {
    const partialVin = techRecord.vin.substr(techRecord.vin.length - 6);

    const query = {
      TableName: this.tableName,
      Key: {
        partialVin,
        vin: techRecord.vin
      },
      UpdateExpression: "set #techRecord = :techRecord",
      ExpressionAttributeNames: {
        "#techRecord": "techRecord"
      },
      ConditionExpression: "vin = :vin AND partialVin = :partialVin",
      ExpressionAttributeValues: {
        ":vin": techRecord.vin,
        ":partialVin": partialVin,
        ":techRecord": techRecord.techRecord
      },
      ReturnValues: "ALL_NEW"
    };
    return dbClient.update(query).promise();
  }

  public createMultiple(techRecordItems: ITechRecordWrapper[]) {
    const params = this.generatePartialParams();

    techRecordItems.forEach((techRecordItem) => {
      params.RequestItems[this.tableName].push(
        {
          PutRequest:
            {
              Item: techRecordItem
            }
        });
    });

    return dbClient.batchWrite(params).promise();
  }

  public deleteMultiple(primaryKeysToBeDeleted: any) {
    const params = this.generatePartialParams();

    primaryKeysToBeDeleted.forEach(([primaryKey, secondaryKey]: [string, string]) => {
      params.RequestItems[this.tableName].push(
        {
          DeleteRequest:
          {
            Key:
            {
              partialVin: primaryKey,
              vin: secondaryKey
            }
          }
        }
      );
    });

    return dbClient.batchWrite(params).promise();
  }

  public generatePartialParams(): any {
    return {
      RequestItems:
      {
        [this.tableName]: []
      }
    };
  }
}

const ONLY_DIGITS_REGEX: RegExp = /^\d+$/;
const TRAILER_REGEX: RegExp = /^[a-zA-Z]\d{6}$/;

const isVinSearch = (searchTerm: string, searchCriteria: ISearchCriteria): boolean => {
  return SEARCHCRITERIA.VIN === searchCriteria || SEARCHCRITERIA.ALL === searchCriteria && searchTerm.length >= 9;
};

const isTrailerSearch = (searchTerm: string, searchCriteria: ISearchCriteria): boolean => {
  return SEARCHCRITERIA.TRAILERID === searchCriteria || SEARCHCRITERIA.ALL === searchCriteria && isTrailerId(searchTerm);
};

const isPartialVinSearch = (searchTerm: string, searchCriteria: ISearchCriteria): boolean => {
  return SEARCHCRITERIA.PARTIALVIN === searchCriteria || SEARCHCRITERIA.ALL === searchCriteria && searchTerm.length === 6 && ONLY_DIGITS_REGEX.test(searchTerm);
};

const isVrmSearch = (searchTerm: string, searchCriteria: ISearchCriteria): boolean => {
  return SEARCHCRITERIA.VRM === searchCriteria || SEARCHCRITERIA.ALL === searchCriteria && searchTerm.length >= 3 && searchTerm.length <= 8;
};

const isTrailerId = (searchTerm: string): boolean => {
  // Exactly 8 numbers
  const isAllNumbersTrailerId = searchTerm.length === 8 && ONLY_DIGITS_REGEX.test(searchTerm);
  // A letter followed by exactly 6 numbers
  const isLetterAndNumbersTrailerId = TRAILER_REGEX.test(searchTerm);
  return isAllNumbersTrailerId || isLetterAndNumbersTrailerId;
};

export {TechRecordsDAO as default, isTrailerSearch, isPartialVinSearch, isTrailerId, isVinSearch, isVrmSearch} ;

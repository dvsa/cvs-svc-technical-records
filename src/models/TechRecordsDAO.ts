import Configuration from "../utils/Configuration";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import QueryInput = DocumentClient.QueryInput;
// @ts-ignore
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
  private readonly ONLY_DIGITS_REGEX: RegExp;
  private readonly TRAILER_REGEX: RegExp;

  constructor() {
    this.tableName = dbConfig.table;
    this.ONLY_DIGITS_REGEX = /^\d+$/;
    this.TRAILER_REGEX = /^[a-zA-Z]\d{6}$/;
  }

  public isTrailerId(searchTerm: string) {
    // Exactly 8 numbers
    const isAllNumbersTrailerId = searchTerm.length === 8 && this.ONLY_DIGITS_REGEX.test(searchTerm);
    // A letter followed by exactly 6 numbers
    const isLetterAndNumbersTrailerId = this.TRAILER_REGEX.test(searchTerm);
    return isAllNumbersTrailerId || isLetterAndNumbersTrailerId;
  }

  public getBySearchTerm(searchTerm: string) {
    const query: QueryInput = {
      TableName: this.tableName,
      KeyConditionExpression: "",
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {}
    };

    if (searchTerm.length >= 9) { // Query for a full VIN
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
    } else if (this.isTrailerId(searchTerm)) { // Query for a Trailer ID
      Object.assign(query, { IndexName: "TrailerIdIndex" });

      Object.assign(query.ExpressionAttributeValues, {
        ":trailerId": searchTerm
      });
      Object.assign(query.ExpressionAttributeNames, {
        "#trailerId": "trailerId"
      });
      query.KeyConditionExpression = "#trailerId = :trailerId";
    } else if (searchTerm.length === 6 && this.ONLY_DIGITS_REGEX.test(searchTerm)) { // Query for a partial VIN
      Object.assign(query.ExpressionAttributeValues, {
        ":partialVin": searchTerm
      });

      Object.assign(query.ExpressionAttributeNames, {
        "#partialVin": "partialVin"
      });
      query.KeyConditionExpression = "#partialVin = :partialVin";
    } else if (searchTerm.length >= 3 && searchTerm.length <= 8) { // Query for a VRM
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

export default TechRecordsDAO;

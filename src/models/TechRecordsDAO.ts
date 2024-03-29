import Configuration from "../utils/Configuration";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import QueryInput = DocumentClient.QueryInput;
import { SEARCHCRITERIA } from "../assets/Enums";
import { ISearchCriteria } from "../../@Types/ISearchCriteria";
import { populatePartialVin } from "../utils/validations/ValidationUtils";
import { LambdaService } from "../services/LambdaService";
import { Vehicle, Trailer } from "../../@Types/TechRecords";
import { PromiseResult } from "aws-sdk/lib/request";
import { AWSError } from "aws-sdk/lib/error";
import { TransactWriteItemsInput } from "aws-sdk/clients/dynamodb";

const dbConfig = Configuration.getInstance().getDynamoDBConfig();
/* tslint:disable */
let AWS: { DynamoDB: { DocumentClient: new (arg0: any) => DocumentClient } };
if (process.env._X_AMZN_TRACE_ID) {
  AWS = require("aws-xray-sdk").captureAWS(require("aws-sdk"));
} else {
  console.log("Serverless Offline detected; skipping AWS X-Ray setup");
  AWS = require("aws-sdk");
}
/* tslint:enable */
const dbClient = new AWS.DynamoDB.DocumentClient(dbConfig.params);

class TechRecordsDAO {
  private readonly tableName: string;
  private static lambdaInvokeEndpoints: any;

  constructor() {
    this.tableName = dbConfig.table;

    if (!TechRecordsDAO.lambdaInvokeEndpoints) {
      TechRecordsDAO.lambdaInvokeEndpoints =
        Configuration.getInstance().getEndpoints();
    }
  }

  private readonly CriteriaIndexMap: { [key: string]: string } = {
    systemNumber: "SysNumIndex",
    partialVin: "PartialVinIndex",
    vrm: "VRMIndex",
    vin: "VinIndex",
    trailerId: "TrailerIdIndex",
  };

  private queryBuilder(
    searchTerm: string,
    searchCriteria: SEARCHCRITERIA,
    query: QueryInput
  ) {
    Object.assign(query.ExpressionAttributeNames!, {
      [`#${searchCriteria}`]:
        searchCriteria === SEARCHCRITERIA.VRM ? "primaryVrm" : searchCriteria,
    });

    Object.assign(query.ExpressionAttributeValues!, {
      [`:${searchCriteria}`]: searchTerm,
    });

    query.KeyConditionExpression = `#${searchCriteria} = :${searchCriteria}`;

    query.IndexName = this.CriteriaIndexMap[searchCriteria];
  }

  public async getBySearchTerm(
    searchTerm: string,
    searchCriteria: ISearchCriteria
  ) {
    searchTerm = searchTerm.toUpperCase();
    const query: QueryInput = {
      TableName: this.tableName,
      IndexName: "",
      KeyConditionExpression: "",
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
    };

    if (isSysNumSearch(searchCriteria)) {
      this.queryBuilder(searchTerm, SEARCHCRITERIA.SYSTEM_NUMBER, query);
    } else if (isVinSearch(searchTerm, searchCriteria)) {
      this.queryBuilder(searchTerm, SEARCHCRITERIA.VIN, query);
    } else if (isTrailerSearch(searchTerm, searchCriteria)) {
      this.queryBuilder(searchTerm, SEARCHCRITERIA.TRAILERID, query);
    } else if (isPartialVinSearch(searchTerm, searchCriteria)) {
      this.queryBuilder(searchTerm, SEARCHCRITERIA.PARTIALVIN, query);
    } else if (isVrmSearch(searchTerm, searchCriteria)) {
      this.queryBuilder(searchTerm, SEARCHCRITERIA.VRM, query);
    }

    console.log("Query Params for getBySearchTerm ", query);
    try {
      return await this.queryAllData(query);
    } catch (err) {
      console.log("Error in queryAllData ", err);
      throw err;
    }
  }

  private async queryAllData(
    params: any,
    allData: ITechRecordWrapper[] = []
  ): Promise<ITechRecordWrapper[]> {
    const data: PromiseResult<DocumentClient.QueryOutput, AWSError> =
      await dbClient.query(params).promise();

    if (data.Items && data.Items.length > 0) {
      allData = [...allData, ...(data.Items as ITechRecordWrapper[])];
    }

    if (data.LastEvaluatedKey) {
      params.ExclusiveStartKey = data.LastEvaluatedKey;
      return this.queryAllData(params, allData);
    } else {
      return allData;
    }
  }

  public createSingle<T extends Vehicle>(vehicle: T) {
    const { vin, systemNumber } = vehicle;
    const query = {
      TableName: this.tableName,
      Item: vehicle,
      ConditionExpression: "vin <> :vin AND systemNumber <> :systemNumber",
      ExpressionAttributeValues: {
        ":vin": vin,
        ":systemNumber": systemNumber,
      },
    };
    return dbClient.put(query).promise();
  }

  public updateSingle<T extends Vehicle>(vehicle: T) {
    const { primaryVrm, secondaryVrms, vin, systemNumber, techRecord } =
      vehicle;
    vehicle.partialVin = populatePartialVin(vin);

    const query = {
      TableName: this.tableName,
      Key: {
        systemNumber,
        vin,
      },
      UpdateExpression: "set techRecord = :techRecord",
      ConditionExpression: "vin = :vin AND systemNumber = :systemNumber",
      ExpressionAttributeValues: {
        ":vin": vin,
        ":systemNumber": systemNumber,
        ":techRecord": techRecord,
      },
      ReturnValues: "ALL_NEW",
    };
    if (primaryVrm) {
      query.UpdateExpression += ", primaryVrm = :primaryVrm";
      Object.assign(query.ExpressionAttributeValues, {
        ":primaryVrm": primaryVrm,
      });
    }
    if (secondaryVrms && secondaryVrms.length) {
      query.UpdateExpression += ", secondaryVrms = :secondaryVrms";
      Object.assign(query.ExpressionAttributeValues, {
        ":secondaryVrms": secondaryVrms,
      });
    }
    if ((vehicle as unknown as Trailer).trailerId) {
      query.UpdateExpression += ", trailerId = :trailerId";
      Object.assign(query.ExpressionAttributeValues, {
        ":trailerId": (vehicle as unknown as Trailer).trailerId,
      });
    }
    return dbClient.update(query).promise();
  }

  public getTrailerId = () =>
    process.env.BRANCH === "local"
      ? Promise.resolve({ trailerId: "123" })
      : this.invokeNumberService({
          path: "/trailerId/",
          httpMethod: "POST",
          resource: "/trailerId/",
        })

  public getSystemNumber = () =>
    process.env.BRANCH === "local"
      ? Promise.resolve({ systemNumber: "123" })
      : this.invokeNumberService({
          path: "/system-number/",
          httpMethod: "POST",
          resource: "/system-number/",
        })

  public getZNumber = () =>
    process.env.BRANCH === "local"
      ? Promise.resolve({ zNumber: "123" })
      : this.invokeNumberService({
          path: "/z-number/",
          httpMethod: "POST",
          resource: "/z-number/",
        })

  public getTNumber = () =>
    process.env.BRANCH === "local"
      ? Promise.resolve({ tNumber: "123" })
      : this.invokeNumberService({
          path: "/t-number/",
          httpMethod: "POST",
          resource: "/t-number/",
        })

  private invokeNumberService = (serviceParams: {
    path: string;
    httpMethod: string;
    resource: string;
  }) =>
    LambdaService.invoke(
      TechRecordsDAO.lambdaInvokeEndpoints.functions.numberGenerationService
        .name,
      serviceParams
    )

  public createMultiple(techRecordItems: ITechRecordWrapper[]) {
    const params = this.generatePartialParams();

    techRecordItems.forEach((techRecordItem: any) => {
      params.RequestItems[this.tableName].push({
        PutRequest: {
          Item: techRecordItem,
        },
      });
    });

    return dbClient.batchWrite(params).promise();
  }

  public deleteMultiple(primaryKeysToBeDeleted: any) {
    const params = this.generatePartialParams();

    primaryKeysToBeDeleted.forEach(
      ([primaryKey, secondaryKey]: [string, string]) => {
        params.RequestItems[this.tableName].push({
          DeleteRequest: {
            Key: {
              systemNumber: primaryKey,
              vin: secondaryKey,
            },
          },
        });
      }
    );

    return dbClient.batchWrite(params).promise();
  }

  public generatePartialParams(): any {
    return {
      RequestItems: {
        [this.tableName]: [],
      },
    };
  }

  public updateVin<T extends Vehicle>(newVehicle: T, oldVehicle: T) {
    const transactionParams = {
      TransactItems: [
        {
          Put: {
            TableName: this.tableName,
            Item: newVehicle,
          },
        },
        {
          Update: {
            TableName: this.tableName,
            Key: {
              systemNumber: oldVehicle.systemNumber,
              vin: oldVehicle.vin,
            },
            UpdateExpression: "set techRecord = :techRecord",
            ConditionExpression: "vin = :vin AND systemNumber = :systemNumber",
            ExpressionAttributeValues: {
              ":vin": oldVehicle.vin,
              ":systemNumber": oldVehicle.systemNumber,
              ":techRecord": oldVehicle.techRecord,
            },
          },
        },
      ],
    } as TransactWriteItemsInput;

    return dbClient.transactWrite(transactionParams).promise();
  }
}

const ONLY_DIGITS_REGEX: RegExp = /^\d+$/;
const DIGITS_AND_SPECIAL_REGEX: RegExp = /^[\d /\\*-]+$/;
const TRAILER_REGEX: RegExp = /^[a-zA-Z]\d{6}$/;

const isSysNumSearch = (searchCriteria: ISearchCriteria): boolean => {
  return SEARCHCRITERIA.SYSTEM_NUMBER === searchCriteria;
};

const isVinSearch = (
  searchTerm: string,
  searchCriteria: ISearchCriteria
): boolean => {
  return (
    SEARCHCRITERIA.VIN === searchCriteria ||
    (SEARCHCRITERIA.ALL === searchCriteria && searchTerm.length >= 9)
  );
};

const isTrailerSearch = (
  searchTerm: string,
  searchCriteria: ISearchCriteria
): boolean => {
  return (
    SEARCHCRITERIA.TRAILERID === searchCriteria ||
    (SEARCHCRITERIA.ALL === searchCriteria && isTrailerId(searchTerm))
  );
};

const isPartialVinSearch = (
  searchTerm: string,
  searchCriteria: ISearchCriteria
): boolean => {
  return (
    SEARCHCRITERIA.PARTIALVIN === searchCriteria ||
    (SEARCHCRITERIA.ALL === searchCriteria &&
      searchTerm.length === 6 &&
      DIGITS_AND_SPECIAL_REGEX.test(searchTerm))
  );
};

const isVrmSearch = (
  searchTerm: string,
  searchCriteria: ISearchCriteria
): boolean => {
  return (
    SEARCHCRITERIA.VRM === searchCriteria ||
    (SEARCHCRITERIA.ALL === searchCriteria &&
      searchTerm.length >= 3 &&
      searchTerm.length <= 8)
  );
};

const isTrailerId = (searchTerm: string): boolean => {
  // Exactly 8 numbers
  const isAllNumbersTrailerId =
    searchTerm.length === 8 && ONLY_DIGITS_REGEX.test(searchTerm);
  const isLetterAndNumbersTrailerId = TRAILER_REGEX.test(searchTerm);
  // A letter followed by exactly 6 numbers
  return isAllNumbersTrailerId || isLetterAndNumbersTrailerId;
};

export {
  TechRecordsDAO as default,
  isTrailerSearch,
  isPartialVinSearch,
  isTrailerId,
  isVinSearch,
  isVrmSearch,
};

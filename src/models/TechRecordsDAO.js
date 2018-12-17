const AWS = require('aws-sdk')
const generateConfig = require('../config/generateConfig')
const config = generateConfig()
const dbClient = new AWS.DynamoDB.DocumentClient(config.DYNAMODB_DOCUMENTCLIENT_PARAMS)

class TechRecordsDAO {
  constructor () {
    this.tableName = config.DYNAMODB_TABLE_NAME
  }

  getBySearchTerm (searchTerm) {
    let query = {
      TableName: this.tableName,
      KeyConditionExpression: null,
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {}
    }

    if (searchTerm.length >= 9) { // We are queried a full VIN
      // The partial VIN is a primary index, and is always required
      Object.assign(query.ExpressionAttributeValues, {
        ':vin': searchTerm,
        ':partialVin': searchTerm.substring(searchTerm.length - 6)
      })

      Object.assign(query.ExpressionAttributeNames, {
        '#vin': 'vin',
        '#partialVin': 'partialVin'
      })

      // And create the query
      query.KeyConditionExpression = '#partialVin = :partialVin AND #vin = :vin'
    } else if (searchTerm.length === 6) { // We are queried a partial VIN
      Object.assign(query.ExpressionAttributeValues, {
        ':partialVin': searchTerm
      })

      Object.assign(query.ExpressionAttributeNames, {
        '#partialVin': 'partialVin'
      })

      query.KeyConditionExpression = '#partialVin = :partialVin'
    } else if (searchTerm.length >= 3 && searchTerm.length <= 8) { // We are queried a VRM
      // If we are queried a VRM, we need to specify we are using the VRM index
      Object.assign(query, { IndexName: 'VRMIndex' })

      Object.assign(query.ExpressionAttributeValues, {
        ':vrm': searchTerm
      })

      Object.assign(query.ExpressionAttributeNames, {
        '#vrm': 'primaryVrm'
      })

      query.KeyConditionExpression = '#vrm = :vrm'
    }

    return dbClient.query(query).promise()
  }

  createMultiple (techRecordItems) {
    var params = this.generatePartialParams()

    techRecordItems.forEach(techRecordItem => {
      params.RequestItems[this.tableName].push(
        {
          PutRequest:
            {
              Item: techRecordItem
            }
        })
    })

    return dbClient.batchWrite(params).promise()
  }

  deleteMultiple (primaryKeysToBeDeleted) {
    var params = this.generatePartialParams()

    primaryKeysToBeDeleted.forEach(([primaryKey, secondaryKey]) => {
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
      )
    })

    return dbClient.batchWrite(params).promise()
  }

  generatePartialParams () {
    return {
      RequestItems:
      {
        [this.tableName]: []
      }
    }
  }
}

module.exports = TechRecordsDAO

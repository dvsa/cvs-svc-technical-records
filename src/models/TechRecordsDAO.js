const AWSXRay = require('aws-xray-sdk')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))
const Configuration = require('../utils/Configuration')
const dbConfig = Configuration.getInstance().getDynamoDBConfig()
const dbClient = new AWS.DynamoDB.DocumentClient(dbConfig.params)

class TechRecordsDAO {
  constructor () {
    this.tableName = dbConfig.table
    this.ONLY_DIGITS_REGEX = /^\d+$/
    this.TRAILER_REGEX = /^[a-zA-Z]\d{6}$/
  }

  isTrailerId (searchTerm) {
    // Exactly 8 numbers
    let isAllNumbersTrailerId = searchTerm.length === 8 && this.ONLY_DIGITS_REGEX.test(searchTerm)
    // A letter followed by exactly 6 numbers
    let isLetterAndNumbersTrailerId = this.TRAILER_REGEX.test(searchTerm)
    return isAllNumbersTrailerId || isLetterAndNumbersTrailerId
  }

  getBySearchTerm (searchTerm) {
    let query = {
      TableName: this.tableName,
      KeyConditionExpression: null,
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {}
    }

    if (searchTerm.length >= 9) { // Query for a full VIN
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
    } else if (this.isTrailerId(searchTerm)) { // Query for a Trailer ID
      Object.assign(query, { IndexName: 'TrailerIdIndex' })

      Object.assign(query.ExpressionAttributeValues, {
        ':trailerId': searchTerm
      })
      Object.assign(query.ExpressionAttributeNames, {
        '#trailerId': 'trailerId'
      })
      query.KeyConditionExpression = '#trailerId = :trailerId'
    } else if (searchTerm.length === 6 && this.ONLY_DIGITS_REGEX.test(searchTerm)) { // Query for a partial VIN
      Object.assign(query.ExpressionAttributeValues, {
        ':partialVin': searchTerm
      })

      Object.assign(query.ExpressionAttributeNames, {
        '#partialVin': 'partialVin'
      })
      query.KeyConditionExpression = '#partialVin = :partialVin'
    } else if (searchTerm.length >= 3 && searchTerm.length <= 8) { // Query for a VRM
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

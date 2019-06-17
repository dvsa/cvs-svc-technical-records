const TechRecordsDao = require('../../src/models/TechRecordsDAO')
const chai = require('chai')
const expect = chai.expect

describe('TechRecordsDAO', () => {
  context('getBySearchTerm', () => {
    context('builds correct request', () => {
      it('for Trailer ID (letter and 6 numbers)', async () => {
        let expectedCall = {
          'TableName': 'cvs-local-technical-records',
          'KeyConditionExpression': '#trailerId = :trailerId',
          'ExpressionAttributeNames': {
            '#trailerId': 'trailerId'
          },
          'ExpressionAttributeValues': {
            ':trailerId': { 'S': 'a123456' }
          },
          'IndexName': 'TrailerIdIndex'
        }

        let techRecordsDao = new TechRecordsDao()
        let daoReq = await techRecordsDao.getBySearchTerm('a123456')

        expect(getRequestBody(daoReq)).to.deep.equal(JSON.stringify(expectedCall))
      })

      it('for Trailer ID (8 numbers)', async () => {
        let expectedCall = {
          'TableName': 'cvs-local-technical-records',
          'KeyConditionExpression': '#trailerId = :trailerId',
          'ExpressionAttributeNames': {
            '#trailerId': 'trailerId'
          },
          'ExpressionAttributeValues': {
            ':trailerId': { 'S': '12345678' }
          },
          'IndexName': 'TrailerIdIndex'
        }

        let techRecordsDao = new TechRecordsDao()
        let daoReq = await techRecordsDao.getBySearchTerm('12345678')

        expect(getRequestBody(daoReq)).to.deep.equal(JSON.stringify(expectedCall))
      })

      it('for Full VIN (>9 chars)', async () => {
        let expectedCall = {
          'TableName': 'cvs-local-technical-records',
          'KeyConditionExpression': '#partialVin = :partialVin AND #vin = :vin',
          'ExpressionAttributeNames': {
            '#vin': 'vin',
            '#partialVin': 'partialVin'
          },
          'ExpressionAttributeValues': {
            ':vin': { 'S': '1234567890' },
            ':partialVin': { 'S': '567890' }
          }
        }

        let techRecordsDao = new TechRecordsDao()
        let daoReq = await techRecordsDao.getBySearchTerm('1234567890')

        expect(getRequestBody(daoReq)).to.deep.equal(JSON.stringify(expectedCall))
      })

      it('for Partial VIN (6 digits)', async () => {
        let expectedCall = {
          'TableName': 'cvs-local-technical-records',
          'KeyConditionExpression': '#partialVin = :partialVin',
          'ExpressionAttributeNames': {
            '#partialVin': 'partialVin'
          },
          'ExpressionAttributeValues': {
            ':partialVin': { 'S': '123456' }
          }
        }

        let techRecordsDao = new TechRecordsDao()
        let daoReq = await techRecordsDao.getBySearchTerm('123456')

        expect(getRequestBody(daoReq)).to.deep.equal(JSON.stringify(expectedCall))
      })

      it('for VRM (8 chars, not matching Trailer Pattern)', async () => {
        let expectedCall = {
          'TableName': 'cvs-local-technical-records',
          'KeyConditionExpression': '#vrm = :vrm',
          'ExpressionAttributeNames': {
            '#vrm': 'primaryVrm'
          },
          'ExpressionAttributeValues': {
            ':vrm': { 'S': '1234567A' }
          },
          'IndexName': 'VRMIndex'
        }

        let techRecordsDao = new TechRecordsDao()
        let daoReq = await techRecordsDao.getBySearchTerm('1234567A')

        expect(getRequestBody(daoReq)).to.deep.equal(JSON.stringify(expectedCall))
      })

      it('for VRM (3 chars)', async () => {
        let expectedCall = {
          'TableName': 'cvs-local-technical-records',
          'KeyConditionExpression': '#vrm = :vrm',
          'ExpressionAttributeNames': {
            '#vrm': 'primaryVrm'
          },
          'ExpressionAttributeValues': {
            ':vrm': { 'S': '67A' }
          },
          'IndexName': 'VRMIndex'
        }

        let techRecordsDao = new TechRecordsDao()
        let daoReq = await techRecordsDao.getBySearchTerm('67A')

        expect(getRequestBody(daoReq)).to.deep.equal(JSON.stringify(expectedCall))
      })

      // <3 or >21 chars handled in getTechRecords Function, so only cursory checks here.
      it('for Non-matching pattern (2 chars)', async () => {
        let techRecordsDao = new TechRecordsDao()
        techRecordsDao.getBySearchTerm('7A')
          .then(() => {
            expect.fail()
          })
          .catch((e) => {
            expect(e.statusCode).to.equal(400)
            expect(e.code).to.equal('ValidationException')
          })
      })
    })
  })
})

let getRequestBody = (dao) => {
  return dao.$response.request.httpRequest.body
}

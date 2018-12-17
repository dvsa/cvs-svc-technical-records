/* global describe context it */
const expect = require('chai').expect
const TechRecordsDAOMock = require('../models/TechRecordsDAOMock')
const TechRecordsService = require('../../src/services/TechRecordsService')
const HTTPError = require('../../src/models/HTTPError')

describe('getTechRecordsList', () => {
  var techRecordsDAOMock = new TechRecordsDAOMock()

  context('when db call returns data', () => {
    it('should return a populated response', () => {
      techRecordsDAOMock.techRecordsMock = [require('../resources/techRecords.json')[0]]
      techRecordsDAOMock.numberOfrecords = 1
      techRecordsDAOMock.numberOfScannedRecords = 1
      var techRecordsService = new TechRecordsService(techRecordsDAOMock)

      return techRecordsService.getTechRecordsList('1B7GG36N12S678410', 'current')
        .then((returnedRecords) => {
          expect(returnedRecords).to.not.equal(undefined)
          expect(returnedRecords).to.not.equal({})
          expect(returnedRecords[0]).to.equal(techRecordsDAOMock.techRecordsMock[0])
          expect(returnedRecords.length).to.be.equal(techRecordsDAOMock.techRecordsMock.length)
        })
    })
  })

  context('when db returns empty data', () => {
    it('should return 404-No resources match the search criteria', () => {
      techRecordsDAOMock.techRecordsMock = {}
      techRecordsDAOMock.numberOfrecords = 0
      techRecordsDAOMock.numberOfScannedRecords = 0
      var techRecordsService = new TechRecordsService(techRecordsDAOMock)

      return techRecordsService.getTechRecordsList()
        .then(() => {
          expect.fail()
        }).catch((errorResponse) => {
          expect(errorResponse).to.be.instanceOf(HTTPError)
          expect(errorResponse.statusCode).to.equal(404)
          expect(errorResponse.body).to.equal('No resources match the search criteria.')
        })
    })
  })
  context('when db return undifined data', () => {
    it('should return 404-No resources match the search criteria if db return null data', () => {
      techRecordsDAOMock.techRecordsMock = undefined
      techRecordsDAOMock.numberOfrecords = 0
      techRecordsDAOMock.numberOfScannedRecords = 0
      var techRecordsService = new TechRecordsService(techRecordsDAOMock)

      return techRecordsService.getTechRecordsList()
        .then(() => {
          expect.fail()
        }).catch((errorResponse) => {
          expect(errorResponse).to.be.instanceOf(HTTPError)
          expect(errorResponse.statusCode).to.equal(404)
          expect(errorResponse.body).to.equal('No resources match the search criteria.')
        })
    })
  })

  context('when db does not return response', () => {
    it('should return 500-Internal Server Error', () => {
      techRecordsDAOMock.isDatabaseOn = false
      var techRecordsService = new TechRecordsService(techRecordsDAOMock)

      return techRecordsService.getTechRecordsList()
        .then(() => {
          expect.fail()
        })
        .catch((errorResponse) => {
          expect(errorResponse).to.be.instanceOf(HTTPError)
          expect(errorResponse.statusCode).to.be.equal(500)
          expect(errorResponse.body).to.equal('Internal Server Error')
        })
    })
  })
})

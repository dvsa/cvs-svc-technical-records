const TechRecordsDAOMock = require('../models/TechRecordsDAOMock')
const TechRecordsService = require('../../src/services/TechRecordsService')
const HTTPError = require('../../src/models/HTTPError')
const expect = require('chai').expect
const fs = require('fs')
const path = require('path')

describe('insertTechRecordsList', () => {
  const techRecordDAOMock = new TechRecordsDAOMock()
  context('database call inserts items', () => {
    it('should return nothing', () => {
      techRecordDAOMock.techRecordsMock = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/technical-records.json'), 'utf8'))
      const techRecordsService = new TechRecordsService(techRecordDAOMock)

      return techRecordsService.insertTechRecordsList(techRecordDAOMock.techRecordsMock)
        .then(data => {
          expect(data).to.equal(undefined)
        })
    })

    it('should return the unprocessed items', () => {
      techRecordDAOMock.unprocessedItems = techRecordDAOMock.techRecordsMock = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/technical-records.json'), 'utf8'))
      const techRecordsService = new TechRecordsService(techRecordDAOMock)

      return techRecordsService.insertTechRecordsList(techRecordDAOMock.techRecordsMock)
        .then(data => {
          expect(data.length).to.equal(13)
        })
    })
  })

  context('database call fails inserting items', () => {
    it('should return error 500', () => {
      techRecordDAOMock.techRecordsMock = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/technical-records.json'), 'utf8'))
      techRecordDAOMock.isDatabaseOn = false
      const techRecordsService = new TechRecordsService(techRecordDAOMock)

      return techRecordsService.insertTechRecordsList(techRecordDAOMock.techRecordsMock)
        .then(() => {})
        .catch((errorResponse) => {
          expect(errorResponse).to.be.instanceOf(HTTPError)
          expect(errorResponse.statusCode).to.be.equal(500)
          expect(errorResponse.body).to.equal('Internal Server Error')
        })
    })
  })
})
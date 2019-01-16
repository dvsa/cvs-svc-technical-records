/* global describe context it before beforeEach after afterEach */
const supertest = require('supertest')
const expect = require('chai').expect
const url = 'http://localhost:3005/'
const request = supertest(url)
const TechRecordsService = require('../../src/services/TechRecordsService')
const TechRecordsDAO = require('../../src/models/TechRecordsDAO')
var _ = require('lodash/core')

describe('techRecords', () => {
  describe('getTechRecords', () => {
    context('when database is populated', () => {
      let techRecordsService = null
      let mockData = require('../resources/techRecords.json')
      let techRecordsDAO = null
      const convertToResponse = (dbObj) => { // Needed to convert an object from the database to a response object
        let responseObj = Object.assign({}, dbObj)

        // Adding primary and secondary VRMs in the same array
        let vrms = [{ vrm: responseObj.primaryVrm, isPrimary: true }]

        Object.assign(responseObj, {
          vrms: vrms
        })

        // Cleaning up unneeded properties
        delete responseObj.primaryVrm // No longer needed
        delete responseObj.secondaryVrms // No longer needed
        delete responseObj.partialVin // No longer needed

        return responseObj
      }

      // Populating the database
      before((done) => {
        techRecordsDAO = new TechRecordsDAO()
        techRecordsService = new TechRecordsService(techRecordsDAO)
        let mockBuffer = mockData.slice()

        let batches = []
        while (mockBuffer.length > 0) {
          batches.push(mockBuffer.splice(0, 25))
        }

        batches.forEach((batch) => {
          techRecordsService.insertTechRecordsList(batch)
        })

        done()
      })

      context('and when a search by VRM is done', () => {
        context('and no statusCode is provided', () => {
          context('and the tech record for that VRM has statusCode \'current\'', () => {
            it('should return the tech record for that VRM with default status \'current\'', (done) => {
              request.get('vehicles/BQ91YHQ/tech-records')
                .end((err, res) => {
                  if (err) { expect.fail(err) }
                  expect(res.statusCode).to.equal(200)
                  expect(res.headers['access-control-allow-origin']).to.equal('*')
                  expect(res.headers['access-control-allow-credentials']).to.equal('true')
                  expect(_.isEqual(convertToResponse(mockData[0]), res.body)).to.equal(true)
                  done()
                })
            })
          })

          context('and the tech record for that VRM does not have statusCode \'current\'', () => {
            it('should return 404', (done) => {
              request.get('vehicles/V916FSB/tech-records')
                .end((err, res) => {
                  if (err) { expect.fail(err) }
                  expect(res.statusCode).to.equal(404)
                  expect(res.headers['access-control-allow-origin']).to.equal('*')
                  expect(res.headers['access-control-allow-credentials']).to.equal('true')
                  expect(res.body).to.equal('No resources match the search criteria.')
                  done()
                })
            })
          })
        })

        context('and statusCode is provided', () => {
          context('and the tech record for that VRM has the statusCode provided', () => {
            it('should return the tech record for that VRM with statusCode \'archived\'', (done) => {
              request.get('vehicles/V916FSB/tech-records?status=archived')
                .end((err, res) => {
                  if (err) { expect.fail(err) }
                  expect(res.statusCode).to.equal(200)
                  expect(res.headers['access-control-allow-origin']).to.equal('*')
                  expect(res.headers['access-control-allow-credentials']).to.equal('true')
                  expect(_.isEqual(convertToResponse(mockData[3]), res.body)).to.equal(true)
                  done()
                })
            })
          })

          context('and the tech record for that VRM does not have statusCode \'archived\'', () => {
            it('should return 404', (done) => {
              request.get('vehicles/BQ91YHQ/tech-records?status=archived')
                .end((err, res) => {
                  if (err) { expect.fail(err) }
                  expect(res.statusCode).to.equal(404)
                  expect(res.headers['access-control-allow-origin']).to.equal('*')
                  expect(res.headers['access-control-allow-credentials']).to.equal('true')
                  expect(res.body).to.equal('No resources match the search criteria.')
                  done()
                })
            })
          })
        })
      })

      context('and when a search by partial VIN is done', () => {
        context('and no statusCode is provided', () => {
          context('and the tech record for that partial VIN has statusCode \'current\'', () => {
            it('should return the tech record for that partial VIN with default status \'current\'', (done) => {
              request.get('vehicles/678410/tech-records')
                .end((err, res) => {
                  if (err) { expect.fail(err) }
                  expect(res.statusCode).to.equal(200)
                  expect(res.headers['access-control-allow-origin']).to.equal('*')
                  expect(res.headers['access-control-allow-credentials']).to.equal('true')
                  expect(_.isEqual(convertToResponse(mockData[0]), res.body)).to.equal(true)
                  done()
                })
            })
          })

          context('and the tech record for that partial VIN does not have statusCode \'current\'', () => {
            it('should return 404', (done) => {
              request.get('vehicles/186664/tech-records')
                .end((err, res) => {
                  if (err) { expect.fail(err) }
                  expect(res.statusCode).to.equal(404)
                  expect(res.headers['access-control-allow-origin']).to.equal('*')
                  expect(res.headers['access-control-allow-credentials']).to.equal('true')
                  expect(res.body).to.equal('No resources match the search criteria.')
                  done()
                })
            })
          })
        })

        context('and statusCode is provided', () => {
          context('and the tech record for that partial VIN has the statusCode provided', () => {
            it('should return the tech record for that partial VIN with statusCode \'archived\'', (done) => {
              request.get('vehicles/186664/tech-records?status=archived')
                .end((err, res) => {
                  if (err) { expect.fail(err) }
                  expect(res.statusCode).to.equal(200)
                  expect(res.headers['access-control-allow-origin']).to.equal('*')
                  expect(res.headers['access-control-allow-credentials']).to.equal('true')
                  expect(_.isEqual(convertToResponse(mockData[3]), res.body)).to.equal(true)
                  done()
                })
            })
          })

          context('and the tech record for that partial VIN does not have statusCode \'archived\'', () => {
            it('should return 404', (done) => {
              request.get('vehicles/678410/tech-records?status=archived')
                .end((err, res) => {
                  if (err) { expect.fail(err) }
                  expect(res.statusCode).to.equal(404)
                  expect(res.headers['access-control-allow-origin']).to.equal('*')
                  expect(res.headers['access-control-allow-credentials']).to.equal('true')
                  expect(res.body).to.equal('No resources match the search criteria.')
                  done()
                })
            })
          })
        })

        context('and the partial VIN provided returns more than one match', () => {
          it('should return 422', (done) => {
            request.get('vehicles/016333/tech-records')
              .end((err, res) => {
                if (err) { expect.fail(err) }
                expect(res.statusCode).to.equal(422)
                expect(res.headers['access-control-allow-origin']).to.equal('*')
                expect(res.headers['access-control-allow-credentials']).to.equal('true')
                expect(res.body).to.equal('The provided partial VIN returned more than one match.')
                done()
              })
          })
        })
      })

      context('and when a search by full VIN is done', () => {
        context('and no statusCode is provided', () => {
          context('and the tech record for that full VIN has statusCode \'current\'', () => {
            it('should return the tech record for that full VIN with default status \'current\'', (done) => {
              request.get('vehicles/1B7GG36N12S678410/tech-records')
                .end((err, res) => {
                  if (err) { expect.fail(err) }
                  expect(res.statusCode).to.equal(200)
                  expect(res.headers['access-control-allow-origin']).to.equal('*')
                  expect(res.headers['access-control-allow-credentials']).to.equal('true')
                  expect(_.isEqual(convertToResponse(mockData[0]), res.body)).to.equal(true)
                  done()
                })
            })
          })

          context('and the tech record for that full VIN does not have statusCode \'current\'', () => {
            it('should return 404', (done) => {
              request.get('vehicles/2FAFP71961X186664/tech-records')
                .end((err, res) => {
                  if (err) { expect.fail(err) }
                  expect(res.statusCode).to.equal(404)
                  expect(res.headers['access-control-allow-origin']).to.equal('*')
                  expect(res.headers['access-control-allow-credentials']).to.equal('true')
                  expect(res.body).to.equal('No resources match the search criteria.')
                  done()
                })
            })
          })
        })

        context('and statusCode is provided', () => {
          context('and the tech record for that full VIN has the statusCode provided', () => {
            it('should return the tech record for that full VIN with statusCode \'archived\'', (done) => {
              request.get('vehicles/2FAFP71961X186664/tech-records?status=archived')
                .end((err, res) => {
                  if (err) { expect.fail(err) }
                  expect(res.statusCode).to.equal(200)
                  expect(res.headers['access-control-allow-origin']).to.equal('*')
                  expect(res.headers['access-control-allow-credentials']).to.equal('true')
                  expect(_.isEqual(convertToResponse(mockData[3]), res.body)).to.equal(true)
                  done()
                })
            })
          })

          context('and the tech record for that full VIN does not have statusCode \'archived\'', () => {
            it('should return 404', (done) => {
              request.get('vehicles/1B7GG36N12S678410/tech-records?status=archived')
                .end((err, res) => {
                  if (err) { expect.fail(err) }
                  expect(res.statusCode).to.equal(404)
                  expect(res.headers['access-control-allow-origin']).to.equal('*')
                  expect(res.headers['access-control-allow-credentials']).to.equal('true')
                  expect(res.body).to.equal('No resources match the search criteria.')
                  done()
                })
            })
          })
        })
      })

      after((done) => {
        let mockBuffer = mockData

        let batches = []
        while (mockBuffer.length > 0) {
          batches.push(mockBuffer.splice(0, 25))
        }

        batches.forEach((batch) => {
          techRecordsService.deleteTechRecordsList(
            batch.map((mock) => {
              return [mock.partialVin, mock.vin]
            })
          )
        })

        done()
      })
    })

    context('when database is empty,', () => {
      it('should return error code 404', (done) => {
        request.get('techRecords').expect(404, done)
      })
    })
  })

  beforeEach((done) => {
    setTimeout(done, 500)
  })
  afterEach((done) => {
    setTimeout(done, 500)
  })
})

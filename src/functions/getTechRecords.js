'use strict'

const TechRecordsDAO = require('../models/TechRecordsDAO')
const TechRecordsService = require('../services/TechRecordsService')
const HTTPResponse = require('../models/HTTPResponse')
const Path = require('path-parser').default

const getTechRecords = (event) => {
  const techRecordsDAO = new TechRecordsDAO()
  const techRecordsService = new TechRecordsService(techRecordsDAO)

  let path = (process.env.BRANCH === 'local') ? event.path : event.pathParameters.proxy
  const getTechRecords = new Path('/vehicles/:searchIdentifier/tech-records')

  if (getTechRecords.test(path)) {
    const searchIdentifier = getTechRecords.test(path).searchIdentifier
    const status = (event.queryStringParameters) ? event.queryStringParameters.status : 'current'

    if (searchIdentifier.length < 3 || searchIdentifier.length > 21) {
      return Promise.resolve(new HTTPResponse(400, 'The search identifier should be between 3 and 21 characters.'))
    }

    return techRecordsService.getTechRecordsList(searchIdentifier, status)
      .then((data) => {
        return new HTTPResponse(200, data)
      })
      .catch((error) => {
        console.error(error)
        return new HTTPResponse(error.statusCode, error.body)
      })
  }

  // If you get to this point, your URL is bad
  return Promise.resolve(new HTTPResponse(400, `Cannot GET ${path}`))
}

module.exports = getTechRecords

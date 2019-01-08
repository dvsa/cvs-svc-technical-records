'use strict'

const TechRecordsDAO = require('../models/TechRecordsDAO')
const TechRecordsService = require('../services/TechRecordsService')
const HTTPResponse = require('../models/HTTPResponse')

const getTechRecords = (event) => {
  const techRecordsDAO = new TechRecordsDAO()
  const techRecordsService = new TechRecordsService(techRecordsDAO)

  let path = (process.env.BRANCH === 'local') ? event.path : event.pathParameters.proxy
  let pathRegex = new RegExp('(\\w{3,}\\b)\\/tech-records\\/?(\\w+\\b)?')
  let matches = pathRegex.exec(path)

  if (matches === null) { // No matches to regex found in URL
    return new HTTPResponse(404, `Resource ${event.path} was not found.`)
  }

  const searchIdentifier = matches[1]
  const status = (matches[2]) ? matches[2] : 'current'

  if (searchIdentifier.length < 3) {
    return new HTTPResponse(400, 'The search identifier should be at least 3 characters long')
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

module.exports = getTechRecords

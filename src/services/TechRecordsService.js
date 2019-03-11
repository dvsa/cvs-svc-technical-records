'use strict'

const HTTPError = require('../models/HTTPError')

/**
 * Fetches the entire list of Technical Records from the database.
 * @returns Promise
 */
class TechRecordsService {
  constructor (techRecordsDAO) {
    this.techRecordsDAO = techRecordsDAO
  }

  getTechRecordsList (searchTerm, status) {
    return this.techRecordsDAO.getBySearchTerm(searchTerm)
      .then(data => {
        if (data.Count === 0) {
          throw new HTTPError(404, 'No resources match the search criteria.')
        }

        if (data.Count > 1) {
          throw new HTTPError(422, 'The provided partial VIN returned more than one match.')
        }

        // Formatting the object for lambda function
        const response = data.Items
          .map((item) => {
            // Adding primary and secondary VRMs in the same array
            let vrms = [{ vrm: item.primaryVrm, isPrimary: true }]
            Object.assign(item, {
              vrms: vrms
            })
            // Cleaning up unneeded properties
            delete item.primaryVrm // No longer needed
            delete item.secondaryVrms // No longer needed
            delete item.partialVin // No longer needed
            // Filtering the tech records based on their status
            item.techRecord = item.techRecord.filter((techRecord) => {
              return techRecord.statusCode === status
            })
            return item
          })
          .filter((item) => { // We do not want results without tech records, so let's fix that
            return item.techRecord.length > 0
          })
        if (response.length === 0) {
          throw new HTTPError(404, 'No resources match the search criteria.')
        }

        return response[0]
      })
      .catch(error => {
        if (!(error instanceof HTTPError)) {
          console.error(error)
          error.statusCode = 500
          error.body = 'Internal Server Error'
        }
        throw new HTTPError(error.statusCode, error.body)
      })
  }

  insertTechRecordsList (techRecordItems) {
    return this.techRecordsDAO.createMultiple(techRecordItems)
      .then(data => {
        if (data.UnprocessedItems) { return data.UnprocessedItems }
      })
      .catch((error) => {
        if (error) {
          console.error(error)
          throw new HTTPError(500, 'Internal Server Error')
        }
      })
  }

  deleteTechRecordsList (techRecordItemKeys) {
    return this.techRecordsDAO.deleteMultiple(techRecordItemKeys)
      .then((data) => {
        if (data.UnprocessedItems) { return data.UnprocessedItems }
      })
      .catch((error) => {
        if (error) {
          console.error(error)
          throw new HTTPError(500, 'Internal Server Error')
        }
      })
  }
}

module.exports = TechRecordsService

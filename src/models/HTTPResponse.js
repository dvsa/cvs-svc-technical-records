'use strict'

class HTTPResponse {
  /**
       * Constructor for the HTTPResponse class
       * @param statusCode the HTTP status code
       * @param body - the response body
       * @param headers - optional - the response headers
       */
  constructor (statusCode, body, headers = {}) {
    if (headers) this.headers = headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Credentials'] = true
    this.statusCode = statusCode
    this.body = JSON.stringify(body)
  }
}

module.exports = HTTPResponse

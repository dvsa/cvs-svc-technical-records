const sinon = require('sinon')
const expect = require('chai').expect
const handler = require('../../src/handler')
const getTechRecords = require('../../src/functions/getTechRecords')
const Configuration = require('../../src/utils/Configuration')
const HTTPResponse = require('../../src/models/HTTPResponse')
const event = require('../resources/event')

describe('The lambda function handler', () => {
  context('With correct Config', () => {
    context('should correctly handle incoming events', () => {
      it('should call functions with correct event payload', async () => {
        // Specify your event, with correct path, payload etc
        let vehicleRecordEvent = event

        // Stub out the actual functions
        let getTechRecordsStub = sinon.stub(getTechRecords)
        getTechRecordsStub.getTechRecords.returns(new HTTPResponse(200, {}))

        let result = await handler.handler(vehicleRecordEvent, null, null)
        expect(result.statusCode).to.equal(200)
        sinon.assert.called(getTechRecordsStub.getTechRecords)
      })

      it('should return error on empty event', async () => {
        let result = await handler.handler(null, null, null)

        expect(result).to.be.instanceOf(HTTPResponse)
        expect(result.statusCode).to.equal(400)
        expect(result.body).to.equal(JSON.stringify('AWS event is empty. Check your test event.'))
      })

      it('should return error on invalid body json', async () => {
        let invalidBodyEvent = Object.assign({}, event)
        invalidBodyEvent.body = '{"hello":}'

        let result = await handler.handler(invalidBodyEvent, null, null)
        expect(result).to.be.instanceOf(HTTPResponse)
        expect(result.statusCode).to.equal(400)
        expect(result.body).to.equal(JSON.stringify('Body is not a valid JSON.'))
      })

      it('should return a Route Not Found error on invalid path', async () => {
        let invalidPathEvent = Object.assign({}, event)
        // invalidPathEvent.body = ""
        invalidPathEvent.path = '/vehicles/123/doesntExist'

        let result = await handler.handler(invalidPathEvent, null, null)
        expect(result.statusCode).to.equal(400)
        expect(result.body).to.deep.equals(JSON.stringify({ error: `Route ${invalidPathEvent.httpMethod} ${invalidPathEvent.path} was not found.` }))
      })
    })
  })

  context('With no routes defined in config', () => {
    it('should return a Route Not Found error', async () => {
      // Stub Config getFunctions method and return empty array instead
      sinon.stub(Configuration.prototype, 'getFunctions').returns([])

      let result = await handler.handler(event, null, null)
      expect(result.statusCode).to.equal(400)
      expect(result.body).to.deep.equals(JSON.stringify({ error: `Route ${event.httpMethod} ${event.path} was not found.` }))
    })
  })
})

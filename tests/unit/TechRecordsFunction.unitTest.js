const expect = require('chai').expect
const LambdaTester = require('lambda-tester')
const GetTechRecordsFunction = require('../../src/functions/getTechRecords')

describe('getTechRecords', () => {
  context('when the path is invalid', () => {
    it('should return 400', () => {
      return LambdaTester(GetTechRecordsFunction)
        .event({
          path: 'test'
        })
        .expectResolve((result) => {
          expect(result.statusCode).to.equal(400)
          expect(result.body).to.equal('"Cannot GET test"')
        })
    })
  })

  context('when the path is valid', () => {
    context('and the vehicle was found', () => {
      it('should return 200', () => {
        return LambdaTester(GetTechRecordsFunction)
          .event({
            path: '/vehicles/XMGDE02FS0H012345/tech-records',
            queryStringParameters: {
              status: 'current'
            }
          })
          .expectResolve((result) => {
            expect(result.statusCode).to.equal(200)
            expect(JSON.parse(result.body).vin).to.equal('XMGDE02FS0H012345')
          })
      })
    })

    context('and the vehicle was not found', () => {
      it('should return 404', () => {
        return LambdaTester(GetTechRecordsFunction)
          .event({
            path: '/vehicles/ABCDE02FS0H012345/tech-records'
          })
          .expectResolve((result) => {
            expect(result.statusCode).to.equal(404)
            expect(result.body).to.equal('"No resources match the search criteria."')
          })
      })
    })

    context('and the search identifier is lower than 3', () => {
      it('should return 400', () => {
        return LambdaTester(GetTechRecordsFunction)
          .event({
            path: '/vehicles/XM/tech-records'
          })
          .expectResolve((result) => {
            expect(result.statusCode).to.equal(400)
            expect(result.body).to.equal('"The search identifier should be between 3 and 21 characters."')
          })
      })
    })
  })
})

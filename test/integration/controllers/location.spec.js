const { request } = require('gaxios')

const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const testUserAuthentication = require('~/app/utils/testUserAuth')
const { UNAUTHORIZED } = require('~/app/consts/errors')
const {
  roles: { TUTOR }
} = require('~/app/consts/auth')

jest.mock('gaxios')

const country = 'Country1'
const mockedCountriesResponse = { data: { data: [{ name: country }] } }
const mockedCitiesResponse = { data: { data: ['City1', 'City2'] } }

describe('Location controller', () => {
  let app, server, accessToken

  beforeAll(async () => {
    ; ({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe('GET countries', () => {
    it('should return a list of countries', async () => {
      request.mockResolvedValueOnce(mockedCountriesResponse)

      const response = await app.get('/location/countries').set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response._body).toEqual([country])
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get('/location/countries')

      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe('GET cities/:country', () => {
    it('should return a list of cities for a specific country', async () => {
      request.mockResolvedValueOnce(mockedCitiesResponse)

      const response = await app.get(`/location/cities/${country}`).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response._body).toEqual(['City1', 'City2'])
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(`/location/cities/${country}`)

      expectError(401, UNAUTHORIZED, response)
    })
  })
})

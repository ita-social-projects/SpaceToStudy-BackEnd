const { request } = require('gaxios')

const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const testUserAuthentication = require('~/utils/testUserAuth')
const { UNAUTHORIZED } = require('~/consts/errors')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

jest.mock('gaxios')

const country = 'Australia'
const countryCode = 'AU'
const mockedCountriesResponse = { data: [{ name: country, iso2: countryCode }] }
const mockedCitiesResponse = { data: [{ name: 'Abbey' }, { name: 'Abbotsbury' }] }
const cities = ['Abbey', 'Abbotsbury']

describe('Location controller', () => {
  let app, server, accessToken

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
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
      expect(response._body).toEqual(mockedCountriesResponse.data)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get('/location/countries')

      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe('GET cities/:country', () => {
    it('should return a list of cities for a specific country', async () => {
      request.mockResolvedValueOnce(mockedCitiesResponse)

      const response = await app.get(`/location/cities/${countryCode}`).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response._body).toEqual(cities)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(`/location/cities/${countryCode}`)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw 500 for failed countries fetch', async () => {
      const errorMessage = 'Failed to fetch cities'
      request.mockRejectedValueOnce(new Error(errorMessage))
      const response = await app.get('/location/countries').set('Cookie', [`accessToken=${accessToken}`])

      expectError(500, { message: errorMessage, code: 'FETCH_CITIES_FAILED' }, response)
    })

    it('should throw 400 for invalid countryCode', async () => {
      const invalidCountryCode = '1'

      const response = await app
        .get(`/location/cities/${invalidCountryCode}`)
        .set('Cookie', [`accessToken=${accessToken}`])

      expectError(400, { message: 'Invalid countryCode. It must be a 2-character string.' }, response)
    })
  })
})

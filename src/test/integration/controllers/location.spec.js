const { request } = require('gaxios')

const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const testUserAuthentication = require('~/utils/testUserAuth')
const { UNAUTHORIZED, FETCH_CITIES_FAILED } = require('~/consts/errors')
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

    it('should throw an error if countryCode is not a string', async () => {
      const invalidCountryCode = 123

      try {
        await app.get(`/location/cities/${invalidCountryCode}`).set('Cookie', [`accessToken=${accessToken}`])
      } catch (error) {
        expect(error.status).toBe(400)
        expect(error.message).toBe(FETCH_CITIES_FAILED)
      }
    })

    it('should throw an error if countryCode length is not 2', async () => {
      const invalidCountryCode = 'A'
      try {
        await app.get(`/location/cities/${invalidCountryCode}`).set('Cookie', [`accessToken=${accessToken}`])
      } catch (error) {
        expect(error.status).toBe(400)
        expect(error.message).toBe(FETCH_CITIES_FAILED)
      }
    })

    it('should not throw an error if countryCode is a valid 2-character string', async () => {
      request.mockResolvedValueOnce(mockedCitiesResponse)
      const response = await app.get(`/location/cities/${countryCode}`).set('Cookie', [`accessToken=${accessToken}`])
      expect(response.statusCode).toBe(200)
      expect(response._body).toEqual(cities)
    })
  })
})

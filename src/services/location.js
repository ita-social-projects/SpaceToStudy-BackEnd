const { request } = require('gaxios')
const {
  config: { LOCATION_API_URL, LOCATION_API_KEY }
} = require('~/configs/config')

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const locationService = {
  getCountries: async () => {
    const res = await request({
      url: LOCATION_API_URL,
      headers: {
        'X-CSCAPI-KEY': LOCATION_API_KEY
      }
    })
    const countries = res.data.map(({ name, iso2 }) => ({ name, iso2 }))

    return [...new Set(countries)]
  },

  getCities: async (countryCode) => {
    if (typeof countryCode !== 'string' || countryCode.length !== 2) {
      throw new ApiError(400, 'Invalid countryCode. It must be a 2-character string.')
    }

    try {
      const res = await request({
        url: `${LOCATION_API_URL}/${countryCode}/cities`,
        headers: {
          'X-CSCAPI-KEY': LOCATION_API_KEY
        }
      })
      const cities = res.data.map((city) => city.name)

      return [...new Set(cities)]
    } catch (error) {
      throw new ApiError(error.response?.status || 500, error.response?.data?.message || 'Internal Server Error')
    }
  }
}

module.exports = locationService

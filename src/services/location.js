const { request } = require('gaxios')
const {
  config: { LOCATION_API_URL, LOCATION_API_KEY }
} = require('~/configs/config')
const { createError } = require('~/utils/errorsHelper')

const locationService = {
  getCountries: async () => {
    try {
      const res = await request({
        url: LOCATION_API_URL,
        headers: {
          'X-CSCAPI-KEY': LOCATION_API_KEY
        }
      })
      const countries = res.data.map(({ name, iso2 }) => ({ name, iso2 }))

      return [...new Set(countries)]
    } catch (error) {
      throw createError(error.response?.status || 500, {
        message: error.response?.data?.message || 'Failed to fetch cities',
        code: 'FETCH_CITIES_FAILED'
      })
    }
  },

  getCities: async (countryCode) => {
    if (typeof countryCode !== 'string' || countryCode.length !== 2) {
      throw createError(400, { message: 'Invalid countryCode. It must be a 2-character string.' })
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
      throw createError(error.response?.status || 500, {
        message: error.response?.data?.message || 'Failed to fetch cities',
        code: 'FETCH_CITIES_FAILED'
      })
    }
  }
}

module.exports = locationService

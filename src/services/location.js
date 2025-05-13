const { request } = require('gaxios')
const {
  config: { LOCATION_API_URL, LOCATION_API_KEY }
} = require('~/configs/config')

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
      throw {
        status: 400,
        message: 'Invalid countryCode. It must be a 2-character string.'
      }
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
      throw {
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Internal Server Error'
      }
    }
  }
}

module.exports = locationService

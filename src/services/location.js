const { request } = require('gaxios')
const {
  config: { LOCATION_API_URL, LOCATION_API_KEY }
} = require('~/configs/config')
const { createError } = require('~/utils/errorsHelper')
const { FETCH_CITIES_FAILED } = require('~/consts/errors')

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
      throw createError(400, FETCH_CITIES_FAILED)
    }

    const res = await request({
      url: `${LOCATION_API_URL}/${countryCode}/cities`,
      headers: {
        'X-CSCAPI-KEY': LOCATION_API_KEY
      }
    })
    const cities = res.data.map((city) => city.name)

    return [...new Set(cities)]
  }
}

module.exports = locationService

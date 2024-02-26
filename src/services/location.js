const { request } = require('gaxios')

const API_URL = 'https://api.countrystatecity.in/v1/countries'
const API_KEY = 'bW94V3phZU84YkhERVNUQmFOOFRDTVpIU3BFWFFJR1BsQUNZRXhjdg=='

const locationService = {
  getCountries: async () => {
    const res = await request({
      url: API_URL,
      headers: {
        'X-CSCAPI-KEY': API_KEY
      }
    })
    const countries = res.data.map(({ name, iso2 }) => ({ name, iso2 }))

    return [...new Set(countries)]
  },

  getCities: async (countryCode) => {
    const res = await request({
      url: `${API_URL}/${countryCode}/cities`,
      headers: {
        'X-CSCAPI-KEY': API_KEY
      }
    })
    const cities = res.data.map((city) => city.name)

    return [...new Set(cities)]
  }
}

module.exports = locationService

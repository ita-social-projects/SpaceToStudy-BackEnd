const { request } = require('gaxios')

const API_URL = 'https://countriesnow.space/api/v0.1'

const locationService = {
  getCountries: async () => {
    const res = await request({ url: `${API_URL}/countries/states` })
    const countries = res.data.data.map((country) => country.name)

    return [...new Set(countries)]
  },

  getCities: async (country) => {
    const res = await request({
      method: 'POST',
      url: `${API_URL}/countries/cities`,
      data: { country }
    })

    return res.data.data
  }
}

module.exports = locationService

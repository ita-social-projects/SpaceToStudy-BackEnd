const locationService = require('~/services/location')

const getCountries = async (_req, res) => {
  const countries = await locationService.getCountries()

  res.status(200).json(countries)
}

const getCities = async (req, res) => {
  const { country } = req.params

  const cities = await locationService.getCities(country)

  res.status(200).json(cities)
}

module.exports = {
  getCountries,
  getCities
}

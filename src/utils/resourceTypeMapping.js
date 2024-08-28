const {
  enums: { RESOURCES_TYPES_ENUM }
} = require('~/consts/validation')
const refs = require('~/consts/models')

const resourceTypeMapping = RESOURCES_TYPES_ENUM.reduce((acc, type) => {
  acc[type] = refs[type.toUpperCase()]
  return acc
}, {})

module.exports = resourceTypeMapping

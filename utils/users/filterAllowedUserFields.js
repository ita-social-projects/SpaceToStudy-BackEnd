const { allowedUserFieldsForUpdate } = require('~/validation/services/user')

const filterAllowedUserFields = (fields) => {
  const updatedFields = {}
  for (const key in fields) {
    if (key in allowedUserFieldsForUpdate) {
      updatedFields[key] = fields[key]
    }
  }
  return updatedFields
}

module.exports = filterAllowedUserFields

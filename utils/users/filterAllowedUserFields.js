const { allowedUserFieldsForUpdate } = require('~/validation/services/user')

const operateField = ({ key, fields, updatedFields }) => {
  const isAllowedField = key in allowedUserFieldsForUpdate
  if (isAllowedField) {
    updatedFields[key] = fields[key]
  }
}
const filterAllowedUserFields = (fields) => {
  const updatedFields = {}
  for (const key in fields) {
    operateField({ key, fields, updatedFields })
  }
  return updatedFields
}

module.exports = filterAllowedUserFields

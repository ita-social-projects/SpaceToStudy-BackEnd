const { allowedUserFieldsForUpdate } = require('~/validation/services/user')

const isObjectEmpty = (obj) => Object.keys(obj).length === 0

const isAllowedField = (key, allowedFields = {}) => {
  if (isObjectEmpty(allowedFields)) return key in allowedUserFieldsForUpdate
  return key in allowedFields
}
const isFieldObject = (key) => typeof key == 'object'

const operateNestedField = ({ key, fields, updatedFields }) => {
  const nestedFields = fields[key]
  for (const nestedKey in nestedFields) {
    if (!updatedFields[key]) updatedFields[key] = {}
    if (!isAllowedField(nestedKey, allowedUserFieldsForUpdate[key])) continue

    updatedFields[key][nestedKey] = nestedFields[nestedKey]
  }
}

const operateField = ({ key, fields, updatedFields }) => {
  if (isAllowedField(key)) {
    if (isFieldObject(fields[key])) operateNestedField({ key, fields, updatedFields })
    else updatedFields[key] = fields[key]
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

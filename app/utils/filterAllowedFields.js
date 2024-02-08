const filterAllowedFields = (fields, allowedFields) => {
  const updatedFields = {}
  for (const key in fields) {
    if (key in allowedFields) {
      updatedFields[key] = fields[key]
    }
  }
  return updatedFields
}

module.exports = filterAllowedFields

const deleteNotAllowedFields = (resource, allowedFields) => {
  Object.keys(resource).forEach((property) => {
    if (!allowedFields.includes(property)) {
      delete resource[property]
    }
  })
}

module.exports = deleteNotAllowedFields

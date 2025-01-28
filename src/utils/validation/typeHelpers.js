const isExpectedType = (expectedType, valueToCheck) => {
  return Array.isArray(valueToCheck) ? valueToCheck.includes(expectedType) : valueToCheck === expectedType
}

const castValueToType = (value, type) => {
  if (type === 'boolean' && value === 'true') {
    return true
  }

  if (type === 'boolean' && value === 'false') {
    return false
  }

  if (type === 'number') {
    return isNaN(Number(value)) ? value : Number(value)
  }

  return value
}

const checkAreTypesValid = (typeOrTypes, field) => {
  const allowedTypes = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes]
  const typeCastedField = castValueToType(field, allowedTypes[0])
  const fieldType = typeof typeCastedField

  return allowedTypes.includes(fieldType)
}

module.exports = {
  isExpectedType,
  castValueToType,
  checkAreTypesValid
}

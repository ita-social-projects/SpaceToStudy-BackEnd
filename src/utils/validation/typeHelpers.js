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

module.exports = {
  isExpectedType,
  castValueToType
}

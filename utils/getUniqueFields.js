const getUniqueFields = (message) => {
  const contentMatch = message.match(/\{([^{}]*?)\}/)
  const content = contentMatch ? contentMatch[1] : ''

  const uniqueFields = content.match(/\b(\w+)(?=:)/g)
  return uniqueFields ? uniqueFields.join(', ') : ''
}

module.exports = getUniqueFields

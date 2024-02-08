const getUniqueFields = (message) => {
  const content = message.match(/\{([^}]+)\}/)[1]

  const uniqueFields = content.match(/\b(\w+)(?=:)/g).join(', ')

  return uniqueFields
}

module.exports = getUniqueFields

const getUniqueFields = (message) => {
  const content = message.match(/\{([^}]+)\}/)[1]

  const keys = content.match(/\b(\w+)(?=:)/g).join(', ')

  return keys
}

module.exports = getUniqueFields

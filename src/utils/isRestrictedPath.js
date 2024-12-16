function isRestrictedPath(path) {
  const stack = new Error().stack.replace(/\\/g, '/')
  return stack.includes(path)
}

module.exports = { isRestrictedPath }

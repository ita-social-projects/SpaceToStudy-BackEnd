const parseURLByTwo = (URL, splitter) => {
  const parts = URL.split(`${splitter}/`)
  return parts.length > 1 ? parts[1] : null
}

module.exports = {
  parseURLByTwo
}

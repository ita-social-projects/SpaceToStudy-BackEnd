const capitalizeFirstLetter = (string) => {
  if (string[0] === string[0].toLowerCase()) {
    return `${string.charAt(0).toUpperCase()}${string.slice(1)}`
  }
  return string
}

module.exports = capitalizeFirstLetter

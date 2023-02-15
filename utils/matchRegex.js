const matchRegex = (regex) => ({
  $regex: regex.length > 0 ? regex : '.*',
  $options: 'i'
})

module.exports = matchRegex

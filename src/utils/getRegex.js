const getRegex = (regex = '') => ({
  $regex: regex.length > 0 ? regex : '.*',
  $options: 'i'
})

module.exports = getRegex

const getRegex = require('../getRegex')

const offerAggregateOptions = (query, params) => {
  const { role, price = {}, proficiencyLevel, rating, languages, name, sort = {}, skip = 0, limit = 5 } = query
  const { categoryId, subjectId } = params

  const { minPrice, maxPrice } = price
  const { orderBy, order } = sort

  const match = {}

  if (role) {
    match.authorRole = role
  }

  if (proficiencyLevel) {
    match.proficiencyLevel = { $in: proficiencyLevel }
  }

  if (minPrice && maxPrice) {
    match.price = { $gte: minPrice, $lte: maxPrice }
  }

  if (rating) {
    match.authorAvgRating = { $gte: rating }
  }

  if (languages) {
    match.languages = getRegex(languages)
  }

  if (name) {
    match.authorName = getRegex(name)
  }

  if (categoryId) {
    match.categoryId = { $match: categoryId }
  }

  if (subjectId) {
    match.subjectId = { $match: subjectId }
  }

  const sortOrder = order === 'asc' ? 1 : -1

  const sortOption = { [orderBy]: sortOrder }

  return { match, sort: sortOption, skip, limit }
}

module.exports = offerAggregateOptions

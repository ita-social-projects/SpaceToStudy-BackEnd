const getRegex = require('../getRegex')

const offerAggregateOptions = (query, params) => {
  const { price = {}, proficiencyLevel = [], rating, languages, sort = {}, limit = 5 } = query
  const { categoryId, subjectId } = params

  const { minPrice, maxPrice } = price
  const { orderBy, order } = sort

  const match = {}

  if (proficiencyLevel.length) {
    match.proficiencyLevel = {
      $in: proficiencyLevel
    }
  }

  if (minPrice && maxPrice) {
    match.price = { $gte: minPrice, $lte: maxPrice }
  }

  if (rating) {
    match['$userId.averageRating.tutor'] = { $gte: rating }
  }

  if (languages) match.languages = getRegex(languages)

  const sortOrder = order === 'asc' ? 1 : -1

  const sortOption = { [orderBy]: sortOrder }

  if (categoryId) match.categoryId = { $match: categoryId }

  if (subjectId) match.subjectId = { $match: subjectId }

  return { match, sort: sortOption, limit: parseInt(limit) }
}

module.exports = offerAggregateOptions

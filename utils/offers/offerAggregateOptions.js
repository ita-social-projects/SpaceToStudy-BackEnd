const getRegex = require('../getRegex')

const offerAggregateOptions = (query, params) => {
  const { role, price = [], proficiencyLevel, rating, language, name = '', sort, skip = 0, limit = 5 } = query
  const { categoryId, subjectId } = params

  const [minPrice, maxPrice] = price
  const nameArray = name.trim().split(' ')
  const firstNameRegex = getRegex(nameArray[0])
  const lastNameRegex = getRegex(nameArray[1])

  const nameQuery = {
    $or: [
      { authorFirstName: firstNameRegex, authorLastName: lastNameRegex },
      { authorFirstName: lastNameRegex, authorLastName: firstNameRegex }
    ]
  }

  const match = { ...nameQuery }

  const sortOption = {}

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
    match.authorAvgRating = { $gte: parseInt(rating) }
  }

  if (language) {
    match.languages = getRegex(language)
  }

  if (categoryId) {
    match.categoryId = categoryId
  }

  if (subjectId) {
    match.subjectId = subjectId
  }

  if (sort) {
    if (sort === 'priceAsc') {
      sortOption['price'] = 1
    } else if (sort === 'priceDesc') {
      sortOption['price'] = -1
    } else {
      sortOption[sort] = 1
    }
  }

  return { match, sort: sortOption, skip, limit }
}

module.exports = offerAggregateOptions

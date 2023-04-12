const getRegex = require('../getRegex')

const offerAggregateOptions = (query, params) => {
  const { role, price, proficiencyLevel, rating, language, name, sort, skip = 0, limit = 5 } = query
  const { categoryId, subjectId } = params

  const match = {}

  if (name) {
    const nameArray = name.trim().split(' ')
    const firstNameRegex = getRegex(nameArray[0])
    const lastNameRegex = getRegex(nameArray[1])

    match['$or'] = [
      { authorFirstName: firstNameRegex, authorLastName: lastNameRegex },
      { authorFirstName: lastNameRegex, authorLastName: firstNameRegex }
    ]
  }

  if (role) {
    match.authorRole = role
  }

  if (proficiencyLevel) {
    match.proficiencyLevel = { $in: proficiencyLevel }
  }

  if (price) {
    const [minPrice, maxPrice] = price
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

  const sortOption = {}

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

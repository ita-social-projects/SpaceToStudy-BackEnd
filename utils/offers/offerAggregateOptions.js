const getRegex = require('../getRegex')

const offerAggregateOptions = (query, params) => {
  const {
    authorRole,
    price,
    proficiencyLevel,
    rating,
    language,
    search,
    languages,
    excludedOfferId,
    sort,
    status = [],
    skip = 0,
    limit = 5
  } = query
  const { categoryId, subjectId, id: authorId } = params

  const match = {}

  if (search) {
    const searchArray = search.trim().split(' ')
    const firstNameRegex = getRegex(searchArray[0])
    const lastNameRegex = getRegex(searchArray[1])

    const additionalFields = authorId
      ? [{ subjectName: getRegex(search) }]
      : [
          { authorFirstName: firstNameRegex, authorLastName: lastNameRegex },
          { authorFirstName: lastNameRegex, authorLastName: firstNameRegex }
        ]

    match['$or'] = [{ title: getRegex(search) }, ...additionalFields]
  }

  if (authorId) {
    match.author = authorId
  }

  if (authorRole) {
    match.authorRole = authorRole
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

  if (languages) {
    match.languages = { $in: languages }
  }

  if (status.length) {
    match.status = { $in: status }
  }

  if (categoryId) {
    match.category = categoryId
  }

  if (subjectId) {
    match.subject = subjectId
  }

  if (excludedOfferId) {
    match._id = { $ne: excludedOfferId }
  }

  const sortOption = {}

  if (sort) {
    if (sort === 'priceAsc') {
      sortOption['price'] = 1
    } else if (sort === 'priceDesc') {
      sortOption['price'] = -1
    } else {
      sortOption[sort] = -1
    }
  }

  return { match, sort: sortOption, skip, limit }
}

module.exports = offerAggregateOptions

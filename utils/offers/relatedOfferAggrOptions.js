const relatedOfferAggrOptions = (query, params) => {
  const { authorRole, level, languages, subject, sort = 'rating', skip = 0, limit = 9 } = query
  const { id } = params

  const match = { _id: { $ne: id } }

  if (authorRole) {
    match.authorRole = authorRole
  }

  if (level) {
    match.proficiencyLevel = { $in: level }
  }

  if (languages) {
    match.languages = { $in: languages }
  }

  if (subject) {
    match.subject = subject
  }

  const sortOption = {}

  if (sort) {
    sortOption[sort] = 1
  }

  return { match, sort: sortOption, skip, limit }
}

module.exports = relatedOfferAggrOptions

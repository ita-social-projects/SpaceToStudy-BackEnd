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
    sort = { createdAt: 1 },
    status,
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
      ? [{ 'subject.name': getRegex(search) }]
      : [
          { 'author.firstName': firstNameRegex, 'author.lastName': lastNameRegex },
          { 'author.firstName': lastNameRegex, 'author.lastName': firstNameRegex }
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
    match.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) }
  }

  if (rating) {
    match['$expr'] = {
      if: { $eq: ['$authorRole', 'student'] },
      then: { $gte: ['$author.averageRating.student', parseInt(rating)] },
      else: { $gte: ['$author.averageRating.tutor', parseInt(rating)] }
    }
  }

  if (language) {
    match.languages = getRegex(language)
  }

  if (languages) {
    match.languages = { $in: languages }
  }

  if (status) {
    match.status = status
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
    } else if (sort === 'authorAvgRating') {
      const field = {
        $cond: {
          if: { $eq: ['$authorRole', 'student'] },
          then: '$author.averageRating.student',
          else: '$author.averageRating.tutor'
        }
      }
      sortOption[field] = 1
    } else {
      sortOption[sort] = -1
    }
  }

  return [
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              averageRating: 1,
              totalReviews: 1,
              photo: 1,
              professionalSummary: 1,
              FAQ: 1
            }
          }
        ],
        as: 'author'
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: 'subject',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1
            }
          }
        ],
        as: 'subject'
      }
    },
    {
      $unwind: '$author'
    },
    {
      $unwind: '$subject'
    },
    {
      $match: match
    },
    {
      $sort: sortOption
    },
    {
      $facet: {
        count: [{ $count: 'count' }],
        offers: [{ $skip: Number(skip) }, { $limit: Number(limit) }]
      }
    },
    {
      $project: {
        count: {
          $cond: {
            if: { $eq: ['$count', []] },
            then: 0,
            else: { $arrayElemAt: ['$count.count', 0] }
          }
        },
        offers: 1
      }
    }
  ]
}

module.exports = offerAggregateOptions

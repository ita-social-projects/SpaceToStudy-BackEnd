const mongoose = require('mongoose')
const getRegex = require('../getRegex')
const {
  enums: { STATUS_ENUM, LOGIN_ROLE_ENUM }
} = require('~/consts/validation')

const getSearchMatch = (search, isSearchFromOwnRequests) => {
  const fullName = search.trim().split(' ')
  const [firstName, lastName] = fullName

  const firstNameRegex = getRegex(firstName)
  const lastNameRegex = getRegex(lastName)

  const subjectFilter = [{ 'subject.name': getRegex(search) }]
  const authorNameFilter = [
    { 'author.firstName': firstNameRegex, 'author.lastName': lastNameRegex },
    { 'author.firstName': lastNameRegex, 'author.lastName': firstNameRegex }
  ]

  const additionalFields = isSearchFromOwnRequests ? subjectFilter : authorNameFilter

  return { $or: [{ title: getRegex(search) }, ...additionalFields] }
}

const getSortOptions = (sort, authorRole) => {
  const sortOption = {}

  if (typeof sort === 'object' && sort.order && sort.orderBy) {
    const { order, orderBy } = sort
    const sortOrder = order === 'asc' ? 1 : -1
    sortOption[orderBy] = sortOrder
  } else if (typeof sort === 'string') {
    if (sort === 'priceAsc') {
      sortOption['price'] = 1
    } else if (sort === 'priceDesc') {
      sortOption['price'] = -1
    } else if (sort === 'rating') {
      sortOption[`author.averageRating.${authorRole}`] = -1
    } else {
      sortOption[sort] = -1
    }
  }

  return sortOption
}

const getActiveRoleMatch = (authorRole) => {
  const ACTIVE_STATUS = STATUS_ENUM[0]

  if (authorRole) {
    return {
      [`author.status.${authorRole}`]: ACTIVE_STATUS
    }
  } else {
    const cases = LOGIN_ROLE_ENUM.map((role) => ({
      case: { $eq: ['$authorRole', role] },
      then: { $eq: [`$author.status.${role}`, ACTIVE_STATUS] }
    }))

    return {
      $expr: {
        $switch: {
          branches: cases
        }
      }
    }
  }
}

const offerAggregateOptions = (query, params, user) => {
  const {
    authorRole,
    price,
    proficiencyLevel,
    rating,
    language,
    search,
    languages,
    nativeLanguage,
    excludedOfferId,
    sort = 'createdAt',
    status,
    skip = 0,
    limit = 5
  } = query
  const { categoryId, subjectId, id: authorId } = params
  const { id: userId } = user

  const match = {}

  const searchMatch = search ? getSearchMatch(search, Boolean(authorId)) : {}

  const activeRoleMatch = authorId !== userId ? getActiveRoleMatch(authorRole) : {}

  if (authorId) {
    match['author._id'] = mongoose.Types.ObjectId(authorId)
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
    match[`author.averageRating.${authorRole}`] = { $gte: parseInt(rating) }
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

  if (nativeLanguage) {
    match['author.nativeLanguage'] = getRegex(nativeLanguage)
  }

  if (categoryId) {
    match['category._id'] = mongoose.Types.ObjectId(categoryId)
  }

  if (subjectId) {
    match['subject._id'] = mongoose.Types.ObjectId(subjectId)
  }

  if (excludedOfferId) {
    match._id = { $ne: mongoose.Types.ObjectId(excludedOfferId) }
  }

  const sortOption = sort ? getSortOptions(sort, authorRole) : {}

  const resultMatch = {
    ...match,
    ...searchMatch,
    ...activeRoleMatch
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
              nativeLanguage: 1,
              photo: 1,
              professionalSummary: 1,
              FAQ: 1,
              status: 1
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
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              appearance: 1
            }
          }
        ],
        as: 'category'
      }
    },
    {
      $lookup: {
        from: 'chats',
        let: { authorId: { $arrayElemAt: ['$author._id', 0] }, userId: mongoose.Types.ObjectId(userId) },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $in: ['$$authorId', '$members.user'] }, { $in: ['$$userId', '$members.user'] }]
              }
            }
          },
          { $project: { _id: 1 } }
        ],
        as: 'chatId'
      }
    },
    {
      $addFields: {
        chatId: {
          $cond: {
            if: { $gt: [{ $size: '$chatId' }, 0] },
            then: { $arrayElemAt: ['$chatId._id', 0] },
            else: null
          }
        }
      }
    },
    {
      $unwind: '$author'
    },
    {
      $unwind: '$category'
    },
    {
      $unwind: '$subject'
    },
    {
      $match: resultMatch
    },
    {
      $sort: sortOption
    },
    {
      $facet: {
        count: [{ $count: 'count' }],
        items: [{ $skip: Number(skip) }, { $limit: Number(limit) }]
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
        items: 1
      }
    }
  ]
}

module.exports = offerAggregateOptions

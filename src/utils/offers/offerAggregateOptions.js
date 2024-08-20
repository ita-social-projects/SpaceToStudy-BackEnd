const mongoose = require('mongoose')
const getRegex = require('../getRegex')
const {
  enums: { STATUS_ENUM, LOGIN_ROLE_ENUM }
} = require('~/consts/validation')

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

  if (authorId !== userId) {
    const ACTIVE_STATUS = STATUS_ENUM[0]

    if (authorRole) {
      match[`author.status.${authorRole}`] = ACTIVE_STATUS
    } else {
      const cases = LOGIN_ROLE_ENUM.map((role) => ({
        case: { $eq: ['$authorRole', role] },
        then: { $eq: [`$author.status.${role}`, ACTIVE_STATUS] }
      }))

      match['$expr'] = {
        $switch: {
          branches: cases
        }
      }
    }
  }

  if (authorId) {
    match['author._id'] = new mongoose.Types.ObjectId(authorId).toString()
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
    match['category._id'] = new mongoose.Types.ObjectId(categoryId).toString()
  }

  if (subjectId) {
    match['subject._id'] = new mongoose.Types.ObjectId(subjectId).toString()
  }

  if (excludedOfferId) {
    match._id = { $ne: new mongoose.Types.ObjectId(excludedOfferId).toString() }
  }

  let sortOption = {}

  if (sort) {
    if (typeof sort === 'object' && sort.order && sort.orderBy) {
      const { order, orderBy } = sort
      const sortOrder = order === 'asc' ? 1 : -1
      sortOption = { [orderBy]: sortOrder }
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
        let: {
          authorId: { $arrayElemAt: ['$author._id', 0] },
          userId: new mongoose.Types.ObjectId(userId).toString()
        },
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
      $match: match
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

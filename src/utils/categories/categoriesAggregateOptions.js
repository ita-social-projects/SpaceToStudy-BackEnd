const getRegex = require('~/utils/getRegex')

const categoriesAggregateOptions = (query) => {
  const { limit = 100, name = '', skip = 0, sort = 'updatedAt' } = query

  let sortOption = {}

  if (sort) {
    if (typeof sort === 'object' && sort.order && sort.orderBy) {
      const { order, orderBy } = sort
      const sortOrder = order === 'asc' ? 1 : -1
      sortOption = { [orderBy]: sortOrder }
    } else if (typeof sort === 'string') {
      if (sort === 'totalOffersAsc') {
        sortOption['totalOffersSum'] = 1
      } else if (sort === 'totalOffersDesc') {
        sortOption['totalOffersSum'] = -1
      } else {
        sortOption[sort] = -1
      }
    }
  }

  return [
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: 'category',
        as: 'subjects'
      }
    },
    {
      $match: {
        name: getRegex(name),
        subjects: { $exists: true, $ne: [] }
      }
    },
    {
      $addFields: {
        totalOffersSum: { $add: ['$totalOffers.student', '$totalOffers.tutor'] }
      }
    },
    {
      $sort: sortOption
    },
    {
      $project: {
        subjects: 0
      }
    },
    {
      $facet: {
        items: [{ $skip: Number(skip) }, { $limit: Number(limit) }, { $project: { totalOffersSum: 0 } }],
        count: [{ $count: 'count' }]
      }
    },
    {
      $project: {
        items: 1,
        count: {
          $cond: {
            if: { $eq: ['$count', []] },
            then: 0,
            else: { $arrayElemAt: ['$count.count', 0] }
          }
        }
      }
    }
  ]
}

module.exports = categoriesAggregateOptions

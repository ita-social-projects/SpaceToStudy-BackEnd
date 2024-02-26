const getRegex = require('~/utils/getRegex')

const categoriesAggregateOptions = (query) => {
  const { limit = 100, name = '', skip = 0 } = query

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
      $sort: { totalOffers: -1, updatedAt: -1 }
    },
    {
      $skip: parseInt(skip)
    },
    {
      $limit: parseInt(limit)
    },
    {
      $project: {
        subjects: 0
      }
    },
    {
      $facet: {
        items: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
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

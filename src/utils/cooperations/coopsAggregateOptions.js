const mongoose = require('mongoose')
const getRegex = require('../getRegex')

const coopsAggregateOptions = (query, params = {}) => {
  const { id, role } = params
  const { skip = 0, limit = 5, status = '', sort = '{ "order": "asc", "orderBy":"updatedAt"}', search } = query
  const match = {}
  const sortOption = {}
  const sortOrder = sort.order === 'asc' ? 1 : -1

  if (sort.orderBy === 'name') {
    sortOption['user.firstName'] = sortOrder
    sortOption['user.lastName'] = sortOrder
  } else {
    sortOption[sort.orderBy] = sortOrder
  }

  if (status) match.status = getRegex(status)
  if (id)
    match.$and = [
      {
        $or: [
          { initiator: mongoose.Types.ObjectId(id), initiatorRole: role },
          { receiver: mongoose.Types.ObjectId(id), receiverRole: role }
        ]
      }
    ]
  if (search) {
    const nameArray = search.trim().split(' ')
    const firstNameRegex = getRegex(nameArray[0])
    const lastNameRegex = getRegex(nameArray[1])

    match.$and[1] = {
      $or: [
        { 'user.firstName': firstNameRegex, 'user.lastName': lastNameRegex },
        { 'user.firstName': lastNameRegex, 'user.lastName': firstNameRegex },
        { 'offer.title': getRegex(search) }
      ]
    }
  }

  return [
    {
      $lookup: {
        from: 'users',
        let: {
          lookUpField: { $cond: [{ $eq: ['$initiator', mongoose.Types.ObjectId(id)] }, '$receiver', '$initiator'] },
          role: {
            $cond: [{ $eq: ['$initiatorRole', role] }, '$receiverRole', '$initiatorRole']
          }
        },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$lookUpField'] } } },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              photo: 1,
              role: '$$role'
            }
          }
        ],
        as: 'user'
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
      $unwind: {
        path: '$user'
      }
    },
    { $unwind: '$category' },
    { $unwind: '$subject' },
    {
      $unset: 'sections'
    },
    {
      $match: match
    },
    {
      $facet: {
        items: [{ $sort: sortOption }, { $skip: Number(skip) }, { $limit: Number(limit) }],
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

module.exports = coopsAggregateOptions

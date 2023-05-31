const mongoose = require('mongoose')
const getRegex = require('../getRegex')

const coopsAggregateOptions = (params = {}, query) => {
  const { id } = params
  const { skip = 0, limit = 5, status = '', sort = '{ order: "updatedAt", orderBy: 1 }', search } = query
  const match = {}

  if (status) match.status = getRegex(status)
  if (id) match.$or = [{ initiator: mongoose.Types.ObjectId(id) }, { receiver: mongoose.Types.ObjectId(id) }]
  if (search) {
    const nameArray = search.trim().split(' ')
    const firstNameRegex = getRegex(nameArray[0])
    const lastNameRegex = getRegex(nameArray[1])

    match['$or'] = [
      { 'user.firstName': firstNameRegex, 'user.lastName': lastNameRegex },
      { 'user.firstName': lastNameRegex, 'user.lastName': firstNameRegex }
    ]
  }

  const lookupLocalField = match.$or[0].initiator === id ? 'initiator' : 'receiver'

  return [
    {
      $lookup: {
        from: 'users',
        localField: lookupLocalField,
        foreignField: '_id',
        pipeline: [{ $project: { firstName: 1, lastName: 1, photo: 1 } }],
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'offers',
        localField: 'offer',
        foreignField: '_id',
        pipeline: [
          { $project: { title: 1, subject: 1 } },
          {
            $lookup: {
              from: 'subjects',
              localField: 'subject',
              foreignField: '_id',
              as: 'subject'
            }
          },
          { $project: { title: 1, subject: { $arrayElemAt: ['$subject', 0] } } }
        ],
        as: 'offer'
      }
    },
    {
      $unwind: {
        path: '$user'
      }
    },
    {
      $unwind: {
        path: '$offer'
      }
    },
    {
      $match: match
    },
    {
      $facet: {
        items: [{ $sort: JSON.parse(sort) }, { $skip: Number(skip) }, { $limit: Number(limit) }],
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

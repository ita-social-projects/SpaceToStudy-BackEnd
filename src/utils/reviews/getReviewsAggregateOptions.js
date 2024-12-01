const { ObjectId } = require('mongoose').Types

const getReviewsAggregateOptions = (match, skip, limit) => {
  if (match.targetUserId) {
    match.targetUserId = ObjectId(match.targetUserId)
  }

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    {
      $unwind: {
        path: '$author',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'offers',
        let: { offerId: '$offer' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $ne: [{ $type: '$$offerId' }, 'missing'] }, { $ne: [{ $type: '$$offerId' }, 'null'] }]
              }
            }
          },
          { $match: { $expr: { $eq: ['$_id', '$$offerId'] } } },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'subjects',
              localField: 'subject',
              foreignField: '_id',
              as: 'subject'
            }
          },
          {
            $unwind: {
              path: '$subject',
              preserveNullAndEmptyArrays: true
            }
          }
        ],
        as: 'offer'
      }
    },
    {
      $unwind: {
        path: '$offer',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'cooperation',
        let: {
          offerId: '$offer._id',
          authorId: '$author._id',
          targetUserId: '$targetUserId'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$offer', '$$offerId'] },
                  {
                    $or: [
                      {
                        $and: [{ $eq: ['$receiver', '$$targetUserId'] }, { $eq: ['$initiator', '$$authorId'] }]
                      },
                      {
                        $and: [{ $eq: ['$receiver', '$$authorId'] }, { $eq: ['$initiator', '$$targetUserId'] }]
                      }
                    ]
                  }
                ]
              }
            }
          }
        ],
        as: 'cooperation'
      }
    },
    {
      $unwind: {
        path: '$cooperation',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        'offer.subject.name': 1,
        'offer.subject._id': 1,
        'offer.category.name': 1,
        'offer.category._id': 1,
        'offer._id': 1,
        'author._id': 1,
        'author.firstName': 1,
        'author.lastName': 1,
        'author.photo': 1,
        proficiencyLevel: '$cooperation.proficiencyLevel',
        comment: 1,
        rating: 1,
        targetUserId: 1,
        targetUserRole: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]

  if (Number.isInteger(skip) && skip > 0) {
    pipeline.push({ $skip: skip })
  }

  if (Number.isInteger(limit) && limit > 0) {
    pipeline.push({ $limit: limit })
  }

  return pipeline
}

module.exports = getReviewsAggregateOptions

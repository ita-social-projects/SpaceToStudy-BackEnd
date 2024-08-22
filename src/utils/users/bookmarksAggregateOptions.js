const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')

const bookmarksAggregateOptions = (userId, query) => {
  const { skip = 0, limit = 8 } = query

  return [
    { $match: { _id: ObjectId(userId) } },
    {
      $lookup: {
        from: 'offers',
        localField: 'bookmarkedOffers',
        foreignField: '_id',
        pipeline: [
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
                    appearance: 1,
                    name: 1
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
            $sort: { createdAt: -1 }
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
        ],
        as: 'offers'
      }
    },
    { $project: { offers: 1, _id: 0 } },
    {
      $unwind: '$offers'
    }
  ]
}

module.exports = bookmarksAggregateOptions

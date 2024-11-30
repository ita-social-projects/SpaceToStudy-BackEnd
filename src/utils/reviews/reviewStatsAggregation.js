const mongoose = require('mongoose')
const Review = require('~/models/review')

const calculateReviewStats = (targetUserId, targetUserRole) => {
  Review.aggregate([
    {
      $match: {
        targetUserId: mongoose.Types.ObjectId(targetUserId),
        targetUserRole
      }
    },
    {
      $facet: {
        numbers: [
          {
            $group: {
              _id: {
                user: '$targetUserId',
                rating: '$rating'
              },
              count: {
                $sum: 1.0
              }
            }
          },
          {
            $group: {
              _id: '$_id.user',
              counts: {
                $push: {
                  rating: '$_id.rating',
                  count: '$count'
                }
              }
            }
          }
        ]
      }
    },
    {
      $unwind: '$numbers'
    },
    {
      $project: {
        _id: 0,
        stats: '$numbers.counts'
      }
    }
  ])
}

module.exports = calculateReviewStats

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
  ])
}

module.exports = calculateReviewStats

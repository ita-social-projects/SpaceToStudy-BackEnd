const recountOfferAmount = (model) => {
  return [
    {
      $lookup: {
        from: 'offers',
        localField: '_id',
        foreignField: model,
        as: 'offers'
      }
    },
    {
      $set: {
        totalOffers: {
          student: {
            $size: {
              $filter: {
                input: '$offers',
                as: 'offer',
                cond: {
                  $and: [{ $eq: ['$$offer.status', 'active'] }, { $eq: ['$$offer.authorRole', 'student'] }]
                }
              }
            }
          },
          tutor: {
            $size: {
              $filter: {
                input: '$offers',
                as: 'offer',
                cond: {
                  $and: [{ $eq: ['$$offer.status', 'active'] }, { $eq: ['$$offer.authorRole', 'tutor'] }]
                }
              }
            }
          }
        }
      }
    },
    {
      $project: { _id: true, totalOffers: true }
    }
  ]
}

module.exports = recountOfferAmount

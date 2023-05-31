const Cooperation = require('~/models/cooperation')

const cooperationService = {
  getCooperations: async ({ skip = 0, limit = 5, match, sort, currentUser }) => {
    const lookupLocalField = match.$or[0].initiator === currentUser ? 'initiator' : 'receiver'

    const result = await Cooperation.aggregate([
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
        $addFields: {
          user: { $arrayElemAt: ['$user', 0] },
          offer: { $arrayElemAt: ['$offer', 0] }
        }
      },
      {
        $match: match
      },
      {
        $facet: {
          items: [{ $sort: sort }, { $skip: skip }, { $limit: limit }],
          count: [{ $count: 'count' }]
        }
      }
    ]).exec()

    return {
      items: result[0].items ?? [],
      count: result[0].count[0]?.count ?? 0
    }
  },

  getCooperationById: async (id) => {
    return await Cooperation.findById(id).populate('offer', ['id', 'author', 'price']).lean().exec()
  },

  createCooperation: async (initiator, data) => {
    const { offer, proficiencyLevel, additionalInfo, receiver, price } = data

    return await Cooperation.create({
      initiator,
      receiver,
      offer,
      price,
      proficiencyLevel,
      additionalInfo
    })
  },

  updateCooperation: async (id, updateData) => {
    const { price, status } = updateData
    const filteredData = {
      ...(price && { price }),
      ...(status && { status })
    }

    await Cooperation.findByIdAndUpdate(id, filteredData, { new: true }).lean().exec()
  }
}

module.exports = cooperationService

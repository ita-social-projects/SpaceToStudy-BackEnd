const ObjectId = require('mongodb').ObjectId
const Offer = require('~/models/offer')

const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedOfferFieldsForUpdate } = require('~/validation/services/offer')
const { createForbiddenError } = require('~/utils/errorsHelper')

const offerService = {
  getOffers: async (pipeline) => {
    const [response] = await Offer.aggregate(pipeline).exec()
    return response
  },

  getOfferById: async (id, userId) => {
    const offer = await Offer.findById(id)
      .populate([
        {
          path: 'author',
          select: ['firstName', 'lastName', 'totalReviews', 'averageRating', 'photo', 'professionalSummary', 'FAQ']
        },
        { path: 'subject', select: 'name' },
        { path: 'category', select: 'appearance' }
      ])
      .lean()
      .exec()

    const [chatLookup] = await Offer.aggregate([
      {
        $match: { _id: new ObjectId(`${id}`).toString() }
      },
      {
        $lookup: {
          from: 'chats',
          let: { authorId: '$author', userId: new ObjectId(`${userId}`).toString() },
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
      }
    ])

    if (offer.author.FAQ && offer.authorRole in offer.author.FAQ) {
      offer.author.FAQ = offer.author.FAQ[offer.authorRole]
    } else {
      delete offer.author.FAQ
    }

    if (chatLookup) {
      offer.chatId = chatLookup.chatId
    }

    return offer
  },

  createOffer: async (author, authorRole, data) => {
    const { price, proficiencyLevel, title, description, languages, enrolledUsers, subject, category, status, FAQ } =
      data

    return await Offer.create({
      author,
      authorRole,
      price,
      proficiencyLevel,
      title,
      description,
      languages,
      enrolledUsers,
      subject,
      category,
      status,
      FAQ
    })
  },

  updateOffer: async (id, currentUserId, updateData) => {
    const filteredUpdateData = filterAllowedFields(updateData, allowedOfferFieldsForUpdate)

    const offer = await Offer.findById(id)

    const author = offer.author.toString()
    const enrollUpdate = Boolean(Object.keys(updateData).length === 1 && updateData.enrolledUsers)

    if (author !== currentUserId && !enrollUpdate) {
      throw createForbiddenError()
    }

    for (let field in filteredUpdateData) {
      offer[field] = filteredUpdateData[field]
    }

    await offer.validate()
    await offer.save()
  },

  deleteOffer: async (id) => {
    await Offer.findByIdAndDelete(id).exec()
  }
}

module.exports = offerService

const Comment = require('~/models/comment')
const Cooperation = require('~/models/cooperation')
const { createForbiddenError } = require('~/utils/errorsHelper')

const commentService = {
  create: async (body) => {
    const { text, author, cooperationId } = body

    const cooperation = await Cooperation.findOne({
      $and: [{ _id: cooperationId }, { $or: [{ receiver: author }, { initiator: author }] }]
    }).exec()

    if (!cooperation) throw createForbiddenError()

    return await Comment.create({ author, cooperation: cooperationId, text })
  },

  getAll: async (cooperationId, userId) => {
    const cooperation = await Cooperation.findOne({
      $and: [{ _id: cooperationId }, { $or: [{ receiver: userId }, { initiator: userId }] }]
    }).exec()

    console.log(cooperation, cooperationId, userId)

    if (!cooperation) throw createForbiddenError()

    return await Comment.find({ cooperation: cooperationId })
      .populate({
        path: 'author',
        select: ['firstName', 'lastName', 'photo']
      })
      .exec()
  }
}

module.exports = commentService

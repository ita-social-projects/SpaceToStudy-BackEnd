const Comment = require('~/models/comment')
const Cooperation = require('~/models/cooperation')
const { createForbiddenError } = require('~/utils/errorsHelper')


const commentService = {
  create: async (body) => {
    const { text, author, cooperation:cooperationId } = body

    const cooperation = await Cooperation.findOne({ 
      $and:[
        { _id:cooperationId}, 
        { $or:[{ receiver:author}, { initiator: author}] }
      ]
    }).exec()

    if(!cooperation) throw createForbiddenError()

    return await Comment.create({ author, cooperation:cooperationId, text})
  },

  getAll: async (cooperation) => {
    return await Comment.find({ _id:cooperation }).populate({
      path:'author', 
      select: ['firstName', 'lastName', 'post']
    }).exec()
  }
}

module.exports = commentService

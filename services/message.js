const Message = require('~/models/message')
const Chat = require('~/models/chat')
const { createForbiddenError } = require('~/utils/errorsHelper')

const messageService = {
  sendMessage: async (author, authorRole, data) => {
    const { text, chat } = data

    return await Message.create({
      author,
      authorRole,
      text,
      chat
    })
  },

  getMessages: async (match, skip, limit) => {
    const { user, chat } = match

    const existingChat = await Chat.findOne({
      $and: [{ _id: chat }, { 'members.user': user }]
    }).exec()

    if (!existingChat) throw createForbiddenError()

    return await Message.find(match)
      .populate({ path: 'author', select: '_id photo' })
      .select('+isRead')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec()
  },

  deleteMessages: async (match) => {
    const { user, chat } = match

    const existingChat = await Chat.findOne({
      $and: [{ _id: chat }, { 'members.user': user }]
    }).exec()

    if (!existingChat) throw createForbiddenError()

    await Message.deleteMany({ chat })
  }
}

module.exports = messageService

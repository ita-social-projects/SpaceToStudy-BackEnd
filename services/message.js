const mongoose = require('mongoose')
const Message = require('~/models/message')
const Chat = require('~/models/chat')
const { createForbiddenError, createBadRequestError, createError } = require('~/utils/errorsHelper')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const messageService = {
  sendMessage: async (author, authorRole, data) => {
    const { text, member, chat, memberRole } = data

    if (!chat && (!member || !memberRole)) throw createBadRequestError()

    if (!chat) {
      const newChat = await Chat.create({
        latestMessage: text,
        members: [
          { user: author, role: authorRole },
          { user: member, role: memberRole }
        ]
      })

      return await Message.create({
        author,
        authorRole,
        text,
        chat: newChat._id,
        clearedFor: []
      })
    }

    const existingChat = await Chat.findById(chat)

    if (!existingChat) throw createError(404, DOCUMENT_NOT_FOUND(Chat.modelName))

    return await Message.create({
      author,
      authorRole,
      text,
      chat,
      clearedFor: []
    })
  },

  getMessages: async (match, skip, limit) => {
    const { user, chat } = match

    const existingChat = await Chat.findOne({
      $and: [{ _id: chat }, { 'members.user': user }]
    }).exec()

    if (!existingChat) throw createForbiddenError()

    const messages = await Message.find({
      chat: chat,
      'clearedFor.user': { $ne: mongoose.Types.ObjectId(user) }
    })
      .populate({ path: 'author', select: '_id photo' })
      .select('+isRead')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec()

    return messages
  },

  deleteMessages: async (match) => {
    const { user, chat } = match

    const existingChat = await Chat.findOne({
      $and: [{ _id: chat }, { 'members.user': user }]
    }).exec()

    if (!existingChat) throw createForbiddenError()

    await Message.deleteMany({ chat })
  },

  clearHistory: async (match) => {
    const { user, chat } = match

    const existingChat = await Chat.findOne({
      $and: [{ _id: chat }, { 'members.user': user }]
    }).exec()

    if (!existingChat) throw createForbiddenError()

    const deleteResult = await Message.deleteMany({ chat, 'clearedFor.user': { $exists: true, $ne: user } }).exec()

    const updateResult = await Message.updateMany(
      { chat, 'clearedFor.user': { $exists: false } },
      { $push: { clearedFor: { user: user } } }
    ).exec()

    return {
      statusCode: updateResult.modifiedCount || deleteResult.deletedCount ? 200 : 304,
      stats: {
        messagesMarkedAsDeleted: updateResult.modifiedCount,
        messagesDeleted: deleteResult.deletedCount
      }
    }
  }
}

module.exports = messageService

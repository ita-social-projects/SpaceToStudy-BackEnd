const mongoose = require('mongoose')
const Message = require('~/models/message')
const Chat = require('~/models/chat')
const { createForbiddenError } = require('~/utils/errorsHelper')

const messageService = {
  sendMessage: async (author, authorRole, data) => {
    const { text, member, chat, memberRole } = data

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
      'clearedFor.user': { $ne: new mongoose.Types.ObjectId(user).toString() }
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

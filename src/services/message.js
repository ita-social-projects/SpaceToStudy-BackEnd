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

  readMessage: async (id) => {
    return await Message.findByIdAndUpdate(id, { isRead: true })
  },

  getMessages: async (match, skip, limit) => {
    const { user, chat } = match

    const existingChat = await Chat.findOne({
      $and: [{ _id: chat }, { 'members.user': user }]
    }).exec()

    if (!existingChat) throw createForbiddenError()

    const result = await Message.aggregate([
      {
        $match: {
          chat: mongoose.Types.ObjectId(chat),
          'clearedFor.user': { $ne: mongoose.Types.ObjectId(user) }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $facet: {
          messages: [
            { $skip: skip || 0 },
            { $limit: limit || 15 },
            {
              $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author'
              }
            },
            { $unwind: '$author' }
          ],
          count: [{ $count: 'total' }]
        }
      }
    ]).exec()

    const messages = result[0].messages
    const messagesCount = result[0].count[0]?.total || 0

    return { items: messages, count: messagesCount }
  },

  deleteMessages: async (match) => {
    const { user, chat } = match

    const existingChat = await Chat.findOne({
      $and: [{ _id: chat }, { 'members.user': user }]
    }).exec()

    if (!existingChat) throw createForbiddenError()

    await Message.deleteMany({ chat })
  },

  deleteAllMessagesByChatIds: async (chatIds) => {
    await Message.deleteMany({ chat: { $in: chatIds } })
  },

  deleteAllMessagesByUser: async (userId) => {
    await Message.deleteMany({ author: userId })
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

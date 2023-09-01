const Message = require('~/models/message')
const Chat = require('~/models/chat')
const { createForbiddenError, createBadRequestError, createNotFoundError, createError } = require('~/utils/errorsHelper')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const messageService = {
  sendMessage: async (author, authorRole, data) => {
    const { text, member, chat, memberRole } = data

    if(!chat && (!member || !memberRole) ) throw createBadRequestError()

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
        chat: newChat._id
      })
    }

    const existingChat = await Chat.findById(chat)

    if(!existingChat) throw createError(404, DOCUMENT_NOT_FOUND(Chat.modelName))

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

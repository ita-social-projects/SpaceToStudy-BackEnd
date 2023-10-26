const mongoose = require('mongoose')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const Chat = require('~/models/chat')
const { createForbiddenError, createError } = require('~/utils/errorsHelper')

const chatService = {
  createChat: async (currentUser, data) => {
    const { id: author, role: authorRole } = currentUser
    const { member, memberRole } = data

    return await Chat.create({
      members: [
        { user: author, role: authorRole },
        { user: member, role: memberRole }
      ],
      deletedFor: []
    })
  },
  getChats: async (currentUser) => {
    const { id: user, role: userRole } = currentUser

    return await Chat.find({
      'members.user': mongoose.Types.ObjectId(user),
      'members.role': userRole,
      'deletedFor.user': { $ne: mongoose.Types.ObjectId(user) }
    }).populate([
      {
        path: 'latestMessage',
        populate: {
          path: 'author',
          select: '_id firstName lastName'
        }
      },
      {
        path: 'members.user',
        select: '_id firstName lastName photo professionalSummary'
      }
    ])
  },
  deleteChat: async (id, currentUser) => {
    const item = await Chat.findById(id).exec()
    const isChatMember = item.members.some((member) => member.user.equals(currentUser))

    if (!isChatMember) {
      throw createForbiddenError()
    }

    await Chat.findByIdAndRemove(id).exec()
  },
  markAsDeletedForCurrentUser: async (id, currentUser) => {
    const chat = await Chat.findById(id).exec()
    const isChatMember = chat.members.some((member) => member.user.equals(currentUser))

    if (!chat) {
      throw createError(404, DOCUMENT_NOT_FOUND(chat.modelName))
    }

    if (!isChatMember) {
      throw createForbiddenError()
    }

    chat.deletedFor.push({ user: currentUser })

    await chat.validate()
    await chat.save()
    return chat
  }
}

module.exports = chatService

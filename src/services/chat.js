const mongoose = require('mongoose')
const { CHAT_ALREADY_EXISTS } = require('~/consts/errors')

const Chat = require('~/models/chat')
const { createForbiddenError, createError } = require('~/utils/errorsHelper')

const chatService = {
  createChat: async (currentUser, data) => {
    const { id: author, role: authorRole } = currentUser
    const { member, memberRole } = data

    const existingChat = await Chat.findOne({
      $or: [
        {
          members: [
            { user: author, role: authorRole },
            { user: member, role: memberRole }
          ]
        },
        {
          members: [
            { user: member, role: memberRole },
            { user: author, role: authorRole }
          ]
        }
      ]
    })

    if (existingChat) {
      throw createError(401, CHAT_ALREADY_EXISTS)
    }

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
      'members.user': new mongoose.Types.ObjectId(user).toString(),
      'members.role': userRole,
      'deletedFor.user': { $ne: new mongoose.Types.ObjectId(user).toString() }
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

    await Chat.findByIdAndDelete(id).exec()
  },
  markAsDeletedForCurrentUser: async (id, currentUser) => {
    const chat = await Chat.findById(id).exec()
    const isChatMember = chat.members.some((member) => member.user.equals(currentUser))

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

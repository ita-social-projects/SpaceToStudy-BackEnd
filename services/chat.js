const mongoose = require('mongoose')

const Chat = require('~/models/chat')
const { createForbiddenError } = require('~/utils/errorsHelper')

const chatService = {
  createChat: async (currentUser, data) => {
    const { id: author, role: authorRole } = currentUser
    const { member, memberRole } = data

    return await Chat.create({
      members: [
        { user: author, role: authorRole },
        { user: member, role: memberRole }
      ]
    })
  },
  getChats: async (currentUser) => {
    const { id: user, role: userRole } = currentUser

    return await Chat.find({
      'members.user': mongoose.Types.ObjectId(user),
      'members.role': userRole
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
  }
}

module.exports = chatService

const mongoose = require('mongoose')

const Chat = require('~/models/chat')

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
  }
}

module.exports = chatService

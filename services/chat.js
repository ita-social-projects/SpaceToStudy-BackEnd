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
  }
}

module.exports = chatService

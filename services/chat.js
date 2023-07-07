const Chat = require('~/models/chat')

const chatService = {
  createChat: async (currentUser, data) => {
    const { id: author, role: authorRole } = currentUser
    const { chatMember, chatMemberRole } = data

    return await Chat.create({
      members: [
        { user: author, role: authorRole },
        { user: chatMember, role: chatMemberRole }
      ]
    })
  }
}

module.exports = chatService

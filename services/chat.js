const Chat = require('~/models/chat')

const chatService = {
  createChat: async (data) => {
    const { author, authorRole, chatMember, chatMemberRole } = data

    return await Chat.create({
      members: [
        { user: author, role: authorRole },
        { user: chatMember, role: chatMemberRole }
      ]
    })
  }
}

module.exports = chatService

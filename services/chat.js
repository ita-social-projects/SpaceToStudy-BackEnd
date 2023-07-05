const Chat = require('~/models/chat')

const chatService = {
  createChat: async (data) => {
    const { members } = data

    return await Chat.create({ members })
  }
}

module.exports = chatService

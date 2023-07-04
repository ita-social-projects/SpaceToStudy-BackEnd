const Message = require('~/models/message')

const messageService = {
  sendMessage: async (author, authorRole, data) => {
    const { text, isRead, isNotified, chat } = data

    return await Message.create({ author, authorRole, text, isRead, isNotified, chat })
  }
}

module.exports = messageService

const Message = require('~/models/message')

const messageService = {
  createMessage: async (data) => {
    const { author, authorRole, text, isRead, isNotified, chat } = data

    return await Message.create({ author, authorRole, text, isRead, isNotified, chat })
  }
}

module.exports = messageService

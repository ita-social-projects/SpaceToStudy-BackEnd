const messageService = require('~/services/message')
const logger = require('~/logger/logger')

module.exports = (io, socket) => {
  const sendMessage = async (data) => {
    const { tempMessageId, authorId, authorRole, receiverId, receiverRole, text, chatId } = data

    try {
      const newMessage = await messageService.sendMessage(authorId, authorRole, {
        member: receiverId,
        memberRole: receiverRole,
        chat: chatId,
        text: text
      })

      io.to(receiverId).emit('receiveMessage', newMessage)

      const deliveredConfirmationPayload = {
        tempMessageId: tempMessageId,
        newMessageId: newMessage.id
      }
      io.to(authorId).emit('messageDeliveredConfirmation', deliveredConfirmationPayload)
    } catch (err) {
      logger.error(err)
      io.to(authorId).emit('sendMessageFailed', tempMessageId)
    }
  }

  const readMessage = async (data) => {
    const { messageId, authorId } = data

    try {
      const messageSeen = await messageService.readMessage(messageId)

      io.to(authorId).emit('messageSeenConfirmation', messageSeen.id)
    } catch (err) {
      logger.error(err)
    }
  }

  const sendTypingStatus = async (data) => {
    const { chatId, receiverId } = data

    io.to(receiverId).emit('typingStatus', chatId)
  }

  socket.on('sendMessage', sendMessage)
  socket.on('messageSeen', readMessage)
  socket.on('sendTypingStatus', sendTypingStatus)
}

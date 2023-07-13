const messageService = require('~/services/message')

const sendMessage = async (req, res) => {
  const { id: author, role: authorRole } = req.user
  const { id: chat } = req.params
  const data = { ...req.body, chat }

  const newMessage = await messageService.sendMessage(author, authorRole, data)

  res.status(201).json(newMessage)
}

const getMessages = async (req, res) => {
  const { id: userId } = req.user
  const { id: chatId } = req.params
  const { skip, limit } = req.query

  const messages = await messageService.getMessages({ userId, chatId }, parseInt(skip), parseInt(limit))

  res.status(200).json(messages)
}

module.exports = {
  sendMessage,
  getMessages
}

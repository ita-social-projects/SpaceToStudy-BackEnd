const messageService = require('~/services/message')

const sendMessage = async (req, res) => {
  const { id: author, role: authorRole } = req.user
  const { id: chat } = req.params
  const data = { ...req.body, chat }

  const newMessage = await messageService.sendMessage(author, authorRole, data)

  res.status(201).json(newMessage)
}

const getMessages = async (req, res) => {
  const { id: user } = req.user
  const { id: chat } = req.params
  const { skip, limit } = req.query

  const messages = await messageService.getMessages({ user, chat }, parseInt(skip), parseInt(limit))

  res.status(200).json(messages)
}

const deleteMessages = async (req, res) => {
  const { id: user } = req.user
  const { id: chat } = req.params

  await messageService.deleteMessages({ user, chat })

  res.status(204).end()
}

module.exports = {
  sendMessage,
  getMessages,
  deleteMessages
}

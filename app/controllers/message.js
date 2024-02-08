const messageService = require('~/app/services/message')
const getRegex = require('~/app/utils/getRegex')

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
  const { skip, limit, message } = req.query
  const match = { chat, user }

  if (message) {
    match.text = getRegex(message)
  }

  const messages = await messageService.getMessages(match, parseInt(skip), parseInt(limit))

  res.status(200).json(messages)
}

const deleteMessages = async (req, res) => {
  const { id: user } = req.user
  const { id: chat } = req.params

  await messageService.deleteMessages({ user, chat })

  res.status(204).end()
}

const clearHistory = async (req, res) => {
  const { id: user } = req.user
  const { id: chat } = req.params

  const responseFunctions = {
    304: (res) => res.status(304).end(),
    200: (res, data) => res.status(200).json(data)
  }
  const defaultResponse = (res) => {
    res.status(500).json({ error: 'Internal Server Error' })
  }

  const { statusCode, stats } = await messageService.clearHistory({ user, chat })
  const responseFunction = responseFunctions[statusCode] || defaultResponse

  responseFunction(res, stats)
}

module.exports = {
  sendMessage,
  getMessages,
  deleteMessages,
  clearHistory
}

const chatService = require('~/services/chat')

const createChat = async (req, res) => {
  const currentUser = req.user
  const data = req.body

  const chat = await chatService.createChat(currentUser, data)

  res.status(201).json(chat)
}

module.exports = {
  createChat
}

const chatService = require('~/services/chat')

const createChat = async (req, res) => {
  const currentUser = req.user
  const data = req.body

  const chat = await chatService.createChat(currentUser, data)

  res.status(201).json(chat)
}

const getChats = async (req, res) => {
  const { id: targetUserId } = req.params
  const { role: targetUserRole } = req.query

  const chats = await chatService.getChats({ targetUserId, targetUserRole })

  res.status(200).json(chats)
}

module.exports = {
  createChat,
  getChats
}

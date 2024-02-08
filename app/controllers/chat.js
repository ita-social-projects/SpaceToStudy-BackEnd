const chatService = require('~/app/services/chat')

const createChat = async (req, res) => {
  const currentUser = req.user
  const data = req.body

  const chat = await chatService.createChat(currentUser, data)

  res.status(201).json(chat)
}

const getChats = async (req, res) => {
  const chats = await chatService.getChats(req.user)

  res.status(200).json(chats)
}

const deleteChat = async (req, res) => {
  const { id } = req.params
  const { id: currentUser } = req.user

  await chatService.deleteChat(id, currentUser)

  res.status(204).end()
}

const markAsDeletedForCurrentUser = async (req, res) => {
  const { id } = req.params
  const { id: currentUser } = req.user

  const markedChat = await chatService.markAsDeletedForCurrentUser(id, currentUser)

  res.status(200).json(markedChat)
}

module.exports = {
  createChat,
  getChats,
  deleteChat,
  markAsDeletedForCurrentUser
}

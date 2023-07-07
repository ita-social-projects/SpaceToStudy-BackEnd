const chatService = require('~/services/chat')

const createChat = async (req, res) => {
  const { id: author, role: authorRole } = req.user
  const { chatMember, chatMemberRole } = req.body

  const chat = await chatService.createChat({ author, authorRole, chatMember, chatMemberRole })

  res.status(201).json(chat)
}

module.exports = {
  createChat
}

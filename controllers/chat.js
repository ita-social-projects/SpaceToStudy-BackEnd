const chatService = require('~/services/chat')

const createChat = async (req, res) => {
  const { id: author, role: authorRole } = req.user
  const { chatMember, chatMemberRole } = req.body
  console.log(req.body)
  const chat = await chatService.createChat({
    members: [
      { user: author, role: authorRole },
      { user: chatMember, role: chatMemberRole }
    ]
  })

  res.status(201).json(chat)
}

module.exports = {
  createChat
}

const messageService = require('~/services/message')

const sendMessage = async (req, res) => {
  const { id: author, role: authorRole } = req.user
  const data = req.body

  const newMessage = await messageService.sendMessage(author, authorRole, data)

  res.status(201).json(newMessage)
}

module.exports = {
  sendMessage
}

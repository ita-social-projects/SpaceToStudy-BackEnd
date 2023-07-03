const messageService = require('~/services/message')

const createMessage = async (req, res) => {
  const data = req.body

  const newMessage = await messageService.createMessage(data)

  res.status(201).json(newMessage)
}

module.exports = {
  createMessage
}

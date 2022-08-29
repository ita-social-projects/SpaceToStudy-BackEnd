const emailService = require('~/services/email')

const sendEmail = async (req, res) => {
  const { email, subject, text } = req.body

  await emailService.sendEmail(email, subject, text)

  res.status(204).end()
}

module.exports = {
  sendEmail
}

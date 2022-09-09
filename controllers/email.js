const emailService = require('~/services/email')

const sendEmail = async (req, res) => {
  const { email, subject, text } = req.body
  const lang = req.lang

  await emailService.sendEmail(email, subject, lang, text)

  res.status(204).end()
}

module.exports = {
  sendEmail
}

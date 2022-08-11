const EmailTemplates = require('email-templates')
const { sendMail } = require('~/utils/mailer')
const { templateList } = require('~/emails')
const {
  gmailCredentials: { user }
} = require('~/configs/config')
const { TEMPLATE_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')
const logger = require('~/logger/logger')

const emailTemplates = new EmailTemplates()

const sendEmail = async (email, subject, text = {}) => {
  try {
    const templateToSend = templateList[subject]

    if (!templateToSend) {
      throw createError(404, TEMPLATE_NOT_FOUND)
    }

    const html = await emailTemplates.render(templateToSend.template, text)

    await sendMail({
      from: `Space2Study <${user}>`,
      to: email,
      subject: templateToSend.subject,
      html
    })
  } catch (err) {
    logger.error(err)
  }
}

module.exports = { sendEmail }

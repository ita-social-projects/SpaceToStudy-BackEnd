const EmailTemplates = require('email-templates')
const { sendMail } = require('~/app/utils/mailer')
const { templateList } = require('~/app/emails')
const {
  gmailCredentials: { user }
} = require('~/app/configs/config')
const { createError } = require('~/app/utils/errorsHelper')
const { TEMPLATE_NOT_FOUND } = require('~/app/consts/errors')

const emailTemplates = new EmailTemplates()

const emailService = {
  sendEmail: async (email, subject, language, text = {}) => {
    const templateToSend = templateList[subject]

    if (!templateToSend) {
      throw createError(404, TEMPLATE_NOT_FOUND)
    }

    const langTemplate = templateToSend[language]

    const html = await emailTemplates.render(langTemplate.template, text)

    await sendMail({
      from: `Space2Study <${user}>`,
      to: email,
      subject: langTemplate.subject,
      html
    })
  }
}

module.exports = emailService

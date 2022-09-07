const EmailTemplates = require('email-templates')
const { sendMail } = require('~/utils/mailer')
const { templateList } = require('~/emails')
const {
  gmailCredentials: { user }
} = require('~/configs/config')
const { createError } = require('~/utils/errorsHelper')
const { TEMPLATE_NOT_FOUND } = require('~/consts/errors')

const emailTemplates = new EmailTemplates()

const emailService = {
  sendEmail: async (email, subject, text = {}) => {
    const templateToSend = templateList[subject]

    if (!templateToSend) {
      throw createError(404, TEMPLATE_NOT_FOUND)
    }

    // provide a preffered lang check here later
    const chosenLangTmpl = templateToSend.en

    const html = await emailTemplates.render(chosenLangTmpl.template, text)

    await sendMail({
      from: `Space2Study <${user}>`,
      to: email,
      subject: chosenLangTmpl.subject,
      html
    })
  }
}

module.exports = emailService

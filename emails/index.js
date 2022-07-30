const emailSubject = require('~/consts/emailSubject')

const templateList = {
  [emailSubject.EMAIL_CONFIRMATION]: {
    subject: 'Please confirm your email',
    template: 'confirm-email'
  },
  [emailSubject.RESET_PASSWORD]: {
    subject: 'Reset your account password',
    template: 'reset-password'
  }
}

module.exports = { templateList }

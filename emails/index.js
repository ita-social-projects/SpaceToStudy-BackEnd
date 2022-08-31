const emailSubject = require('~/consts/emailSubject')

const templateList = {
  [emailSubject.EMAIL_CONFIRMATION]: {
    subject: 'Please confirm your email',
    template: 'confirm-email'
  },
  [emailSubject.RESET_PASSWORD]: {
    subject: 'Reset your account password',
    template: 'reset-password'
  },
  [emailSubject.LONG_TIME_WITHOUT_LOGIN]: {
    subject: 'You have been inactive for too long',
    template: 'long-time-without-login'
  }
}

module.exports = { templateList }

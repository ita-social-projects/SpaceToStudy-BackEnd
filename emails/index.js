const emailSubject = require('~/consts/emailSubject')

const templateList = {
  [emailSubject.EMAIL_CONFIRMATION]: {
    subject: 'Please confirm your email',
    template: 'confirm-email'
  }
}

module.exports = { templateList }

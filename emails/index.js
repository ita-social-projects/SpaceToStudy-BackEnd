const emailSubject = require('~/consts/emailSubject')

const templateList = {
  [emailSubject.EMAIL_CONFIRMATION]: {
    subject: 'Space2Study: Confirm your email',
    template: 'confirm-email'
  }
}

module.exports = { templateList }

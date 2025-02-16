const emailSubject = require('~/consts/emailSubject')

const path = __dirname
const templateList = {
  [emailSubject.EMAIL_CONFIRMATION]: {
    en: {
      subject: 'Please confirm your email',
      template: path + '/en/confirm-email'
    },
    uk: {
      subject: 'Будь ласка, підтвердіть свою електронну адресу',
      template: path + '/uk/confirm-email'
    }
  },
  [emailSubject.RESET_PASSWORD]: {
    en: {
      subject: 'Reset your account password',
      template: path + '/en/reset-password'
    },
    uk: {
      subject: 'Скиньте пароль для свого акаунту',
      template: path + '/uk/reset-password'
    }
  },
  [emailSubject.SUCCESSFUL_PASSWORD_RESET]: {
    en: {
      subject: 'Your password was changed',
      template: path + '/en/sucessful-password-reset'
    },
    uk: {
      subject: 'Ваш пароль було змінено',
      template: path + '/uk/sucessful-password-reset'
    }
  },
  [emailSubject.LONG_TIME_WITHOUT_LOGIN]: {
    en: {
      subject: 'You have been inactive for too long',
      template: path + '/en/long-time-without-login'
    },
    uk: {
      subject: 'Ви занадто довго були неактивні',
      template: path + '/uk/long-time-without-login'
    }
  },
  [emailSubject.ADMIN_INVITATION]: {
    en: {
      subject: 'Admin invitation',
      template: path + '/en/invite-admin'
    },
    uk: {
      subject: 'Запрошення адміна',
      template: path + '/uk/invite-admin'
    }
  }
}

module.exports = { templateList }

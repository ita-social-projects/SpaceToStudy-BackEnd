const emailSubject = require('~/consts/emailSubject')

const templateList = {
  [emailSubject.EMAIL_CONFIRMATION]: {
    en: {
      subject: 'Please confirm your email',
      template: 'en/confirm-email'
    },
    ua: {
      subject: 'Будь ласка, підтвердіть свою електронну адресу',
      template: 'ua/confirm-email'
    }
  },
  [emailSubject.RESET_PASSWORD]: {
    en: {
      subject: 'Reset your account password',
      template: 'en/reset-password'
    },
    ua: {
      subject: 'Скиньте пароль для свого акаунту',
      template: 'ua/reset-password'
    }
  },
  [emailSubject.SUCCESSFUL_PASSWORD_RESET]: {
    en: {
      subject: 'Your password was changed',
      template: 'en/sucessful-password-reset'
    },
    ua: {
      subject: 'Ваш пароль було змінено',
      template: 'ua/sucessful-password-reset'
    }
  },
  [emailSubject.LONG_TIME_WITHOUT_LOGIN]: {
    en: {
      subject: 'You have been inactive for too long',
      template: 'en/long-time-without-login'
    },
    ua: {
      subject: 'Ви занадто довго були неактивні',
      template: 'ua/long-time-without-login'
    }
  },
  [emailSubject.ADMIN_INVITATION]: {
    en: {
      subject: 'Admin invitation',
      template: 'en/invite-admin'
    },
    ua: {
      subject: 'Запрошення адміна',
      template: 'ua/invite-admin'
    }
  }
}

module.exports = { templateList }

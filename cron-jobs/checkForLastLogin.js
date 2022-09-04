const CronJob = require('cron').CronJob
const userService = require('~/services/user')
const emailService = require('~/services/email')
const emailSubject = require('~/consts/emailSubject')
const { oneDayInMs } = require('~/consts/auth')

const DAYS_TO_SEND_EMAILS = 173
const DAYS_TO_DELETE_USER = 180

const checkUsersForLastLogin = new CronJob('00 00 03 * * *', () => checkLastLogin())

const checkLastLogin = async () => {
  const users = await userService.getUsers()
  const dateNow = new Date()

  return Promise.all(
    users.map(async ({ email, firstName, lastLogin, language, _id }) => {
      if (!lastLogin) {
        return
      }

      const differenceInDays = Math.floor((dateNow.getTime() - lastLogin.getTime()) / oneDayInMs)
      if (differenceInDays === daysToSendEmail) {
        await emailService.sendEmail(email, emailSubject.LONG_TIME_WITHOUT_LOGIN, language, { email, firstName })
      }
      if (differenceInDays >= daysToDeleteUser) {
        await userService.deleteUser(_id)
      }
    })
  )
}

module.exports = checkUsersForLastLogin

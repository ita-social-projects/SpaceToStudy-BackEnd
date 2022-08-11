const CronJob = require('cron').CronJob
const User = require('~/models/user')
const { sendEmail } = require('~/utils/emailService')
const emailSubject = require('~/consts/emailSubject')
const { oneDayInMs } = require('~/consts/auth')

const checkUsersForLastLogin = new CronJob('00 00 03 * * *', () => checkLastLogin())

const checkLastLogin = async () => {
  const users = await User.find().exec()
  const dateNow = new Date()
  const daysToSendEmail = 173
  const daysToDeleteUser = 180

  users.forEach(async (user) => {
    const { email, firstName, lastLogin, _id } = user
    if (lastLogin) {
      const differenceInDays = Math.floor((dateNow.getTime() - lastLogin.getTime()) / oneDayInMs)
      if (differenceInDays === daysToSendEmail) {
        await sendEmail(email, emailSubject.LONG_TIME_WITHOUT_LOGIN, { email, firstName })
      }
      if (differenceInDays >= daysToDeleteUser) {
        await User.deleteOne({ _id })
      }
    }
  })
}

module.exports = checkUsersForLastLogin

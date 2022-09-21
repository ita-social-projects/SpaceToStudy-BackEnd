const CronJob = require('cron').CronJob
const tokenService = require('~/services/token')
const userService = require('~/services/user')
const { tokenNames } = require('~/consts/auth')

const EVERY_MIDNIGHT = '0 0 * * *'

const removeUnverifiedUsers = new CronJob(EVERY_MIDNIGHT, () => removeUsersWithUnconfirmedEmail())

const removeUsersWithUnconfirmedEmail = async () => {
  const usersWithConfirmToken = await tokenService.findTokensWithUsersByParams({ confirmToken: { $ne: null } })

  if (!usersWithConfirmToken.length) {
    return
  }

  const unconfirmedUsersData = usersWithConfirmToken.filter(({ user }) => user && !user.isEmailConfirmed)

  await Promise.all(
    unconfirmedUsersData?.map(async ({ confirmToken }) => {
      const payload = await tokenService.validateConfirmToken(confirmToken)

      if (payload && payload.id) {
        return
      }

      const tokenData = await tokenService.findToken(confirmToken, tokenNames.CONFIRM_TOKEN)

      if (!tokenData) {
        return
      }

      await userService.deleteUser(tokenData.user)
      return tokenService.removeConfirmToken(tokenData.confirmToken)
    })
  )
}

module.exports = { removeUsersWithUnconfirmedEmail, removeUnverifiedUsers }

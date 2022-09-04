const CronJob = require('cron').CronJob
const tokenService = require('~/services/token')
const userService = require('~/services/user')

const EVERY_MIDNIGHT = '0 0 * * *'

const removeUnverifiedUsers = new CronJob(EVERY_MIDNIGHT, () => removeUsersWithUnconfirmedEmail())

const removeUsersWithUnconfirmedEmail = async () => {
  
  const usersWithConfirmToken = await tokenService.findTokensWithUsersByParams({ confirmToken: { $ne: null } })

  if(!usersWithConfirmToken?.length){
    return
  }

  const unconfirmedUsersData = usersWithConfirmToken?.filter(({ user }) => user && !user.isEmailConfirmed)

  return Promise.all(
    unconfirmedUsersData?.map(async ({ confirmToken }) => {
      const payload = tokenService.validateConfirmToken(confirmToken)

      if (payload?.userId) {
        return
      }

      const confirmTokenData = await tokenService.findToken(confirmToken,'confirmToken')

      if(!confirmTokenData){
        return
      }

      await userService.deleteUser(confirmTokenData.userId)
      return tokenService.removeConfirmToken(confirmToken)
    })
  )
}

module.exports = removeUnverifiedUsers

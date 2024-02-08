const User = require('~/app/models/user')
const {
  roles: { SUPERADMIN }
} = require('~/app/consts/auth')
const SeedSuperAdmin = require('~/app/seed/seedSuperAdmin')
const logger = require('~/app/logger/logger')

const checkUserExistence = async () => {
  try {
    const isUserExist = await User.exists({ role: SUPERADMIN })

    if (!isUserExist) {
      return await SeedSuperAdmin.createSuperAdmin()
    }
  } catch (err) {
    logger.error(err)
  }
}

module.exports = checkUserExistence

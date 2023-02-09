const User = require('~/models/user')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const SeedAdmin = require('~/seed/seedAdmin')
const logger = require('~/logger/logger')

const checkUserExistence = async () => {
  try {
    const isUserExist = await User.exists({ role: ADMIN })

    if (!isUserExist) {
      return await SeedAdmin.createAdmin()
    }
  } catch (err) {
    logger.error(err)
  }
}

module.exports = checkUserExistence

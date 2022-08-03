const User = require('~/models/user')
const Role = require('~/models/role')
const {
  roles: { SUPERADMIN }
} = require('~/consts/auth')
const SeedSuperAdmin = require('~/seed/seedSuperAdmin')
const checkRoleExistence = require('~/seed/checkRoleExistence')
const logger = require('~/logger/logger')

const checkUserExistence = async () => {
  try {
    await checkRoleExistence()

    const foundRole = await Role.findOne({ value: SUPERADMIN })
    const userCount = await User.countDocuments({ role: foundRole._id }).exec()

    if (!userCount) {
      await SeedSuperAdmin.createSuperAdminUser()
    }
  } catch (err) {
    logger.error(err)
  }
}

module.exports = checkUserExistence

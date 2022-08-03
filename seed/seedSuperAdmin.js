const User = require('~/models/user')
const Role = require('~/models/role')
const {
  superAdmin: { firstName, lastName, email, password }
} = require('~/consts/seed')
const {
  roles: { SUPERADMIN }
} = require('~/consts/auth')
const { hashPassword } = require('~/utils/passwordHelper')
const logger = require('~/logger/logger')

const SeedSuperAdmin = {
  createSuperAdminUser: async () => {
    try {
      const hashedPassword = await hashPassword(password)
      const isActivated = true
      const foundRole = await Role.findOne({ value: SUPERADMIN }).exec()

      const superAdminUser = { role: foundRole._id, firstName, lastName, email, password: hashedPassword, isActivated }
      await User.create({ ...superAdminUser })

      return superAdminUser
    } catch (err) {
      logger.error(err)
    }
  }
}

module.exports = SeedSuperAdmin

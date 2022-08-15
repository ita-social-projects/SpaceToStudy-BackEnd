const User = require('~/models/user')
const Role = require('~/models/role')
const {
  superAdmin: { firstName, lastName, email, password }
} = require('~/configs/config')
const {
  roles: { SUPERADMIN }
} = require('~/consts/auth')
const { hashPassword } = require('~/utils/passwordHelper')
const logger = require('~/logger/logger')

const SeedSuperAdmin = {
  createSuperAdmin: async () => {
    try {
      const hashedPassword = await hashPassword(password)
      const role = await Role.findOne({ value: SUPERADMIN }).exec()
      const superAdmin = { role, firstName, lastName, email, password: hashedPassword, isEmailConfirmed: true }

      return await User.create(superAdmin)
    } catch (err) {
      logger.error(err)
    }
  }
}

module.exports = SeedSuperAdmin

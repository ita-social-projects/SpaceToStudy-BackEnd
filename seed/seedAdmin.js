const User = require('~/models/user')
const {
  admin: { firstName, lastName, email, password }
} = require('~/configs/config')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const { hashPassword } = require('~/utils/passwordHelper')
const logger = require('~/logger/logger')

const SeedAdmin = {
  createAdmin: async () => {
    try {
      const hashedPassword = await hashPassword(password)
      const admin = {
        role: ADMIN,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        active: true,
        isEmailConfirmed: true
      }

      return await User.create(admin)
    } catch (err) {
      logger.error(err)
    }
  }
}

module.exports = SeedAdmin

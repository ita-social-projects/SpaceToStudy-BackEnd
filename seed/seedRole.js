const Role = require('~/models/role')
const {
  roles: { STUDENT, MENTOR, ADMIN, SUPERADMIN }
} = require('~/consts/auth')
const logger = require('~/logger/logger')

const SeedRole = {
  createStudentRole: async () => {
    try {
      const studentRole = await Role.create({ value: STUDENT })

      return studentRole
    } catch (err) {
      logger.error(err)
    }
  },

  createMentorRole: async () => {
    try {
      const mentorRole = await Role.create({ value: MENTOR })

      return mentorRole
    } catch (err) {
      logger.error(err)
    }
  },

  createAdminRole: async () => {
    try {
      const adminRole = await Role.create({ value: ADMIN })

      return adminRole
    } catch (err) {
      logger.error(err)
    }
  },

  createSuperAdminRole: async () => {
    try {
      const superAdminRole = await Role.create({ value: SUPERADMIN })

      return superAdminRole
    } catch (err) {
      logger.error(err)
    }
  }
}

module.exports = SeedRole

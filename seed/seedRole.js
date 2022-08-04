const Role = require('~/models/role')
const {
  roles: { STUDENT, MENTOR, ADMIN, SUPERADMIN }
} = require('~/consts/auth')
const logger = require('~/logger/logger')

const SeedRole = {
  createRole: async (role) => {
    try {
      const roleToCreate = await Role.create({ value: role })

      return roleToCreate
    } catch (err) {
      logger.error(err)
    }
  },

  createStudentRole: async () => {
    return await SeedRole.createRole(STUDENT)
  },

  createMentorRole: async () => {
    return await SeedRole.createRole(MENTOR)
  },

  createAdminRole: async () => {
    return await SeedRole.createRole(ADMIN)
  },

  createSuperAdminRole: async () => {
    return await SeedRole.createRole(SUPERADMIN)
  }
}

module.exports = SeedRole

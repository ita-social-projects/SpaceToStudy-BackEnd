const Role = require('~/models/role')
const {
  roles: { STUDENT, MENTOR, ADMIN, SUPERADMIN }
} = require('~/consts/auth')
const SeedRole = require('~/seed/seedRole')
const logger = require('~/logger/logger')

const checkRoleExistence = async () => {
  try {
    const studentCount = await Role.countDocuments({ value: STUDENT }).exec()

    if (!studentCount) {
      await SeedRole.createStudentRole()
    }

    const mentorCount = await Role.countDocuments({ value: MENTOR }).exec()

    if (!mentorCount) {
      await SeedRole.createMentorRole()
    }

    const adminCount = await Role.countDocuments({ value: ADMIN }).exec()

    if (!adminCount) {
      await SeedRole.createAdminRole()
    }

    const superAdminCount = await Role.countDocuments({ value: SUPERADMIN }).exec()

    if (!superAdminCount) {
      await SeedRole.createSuperAdminRole()
    }
  } catch (err) {
    logger.error(err)
  }
}

module.exports = checkRoleExistence

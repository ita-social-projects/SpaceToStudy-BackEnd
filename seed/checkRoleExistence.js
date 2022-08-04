const Role = require('~/models/role')
const { roles } = require('~/consts/auth')
const SeedRole = require('~/seed/seedRole')
const logger = require('~/logger/logger')

const checkRoleExistence = async () => {
  try {
    return Promise.all(
      Object.values(roles).map(async (role) => {
        const isRoleExist = await Role.countDocuments({ value: role }).exec()

        if (isRoleExist) {
          return
        }

        return SeedRole.createRole(role)
      })
    )
  } catch (err) {
    logger.error(err)
  }
}

module.exports = checkRoleExistence

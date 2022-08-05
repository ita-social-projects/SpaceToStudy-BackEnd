const Role = require('~/models/role')
const { roles } = require('~/consts/auth')
const SeedRole = require('~/seed/seedRole')
const logger = require('~/logger/logger')

const checkRoleExistence = async () => {
  try {
    await Promise.all(
      Object.values(roles).map(async (role) => {
        const isRoleExist = await Role.exists({ value: role })

        if (isRoleExist) {
          return
        }

        return await SeedRole.createRole(role)
      })
    )
  } catch (err) {
    logger.error(err)
  }
}

module.exports = checkRoleExistence

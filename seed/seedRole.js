const Role = require('~/models/role')
const logger = require('~/logger/logger')

const SeedRole = {
  createRole: async (role) => {
    try {
      return await Role.create({ value: role })
    } catch (err) {
      logger.error(err)
    }
  }
}

module.exports = SeedRole

const Role = require('~/models/role')
const { ROLE_ALREADY_EXIST, ROLE_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const roleService = {
  createRole: async (value) => {
    const roleDuplicate = await Role.findOne({ value })

    if (roleDuplicate) {
      throw createError(409, ROLE_ALREADY_EXIST)
    }

    const newRole = await Role.create({ value })

    return newRole
  },

  getRoleByValue: async (value) => {
    const role = await Role.findOne({ value })

    if (!role) {
      throw createError(404, ROLE_NOT_FOUND)
    }

    return role
  }
}

module.exports = roleService

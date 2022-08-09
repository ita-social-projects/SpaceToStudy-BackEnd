const User = require('~/models/user')
const Role = require('~/models/role')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const { USER_NOT_REGISTERED } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const adminService = {
  getAdmins: async () => {
    const role = await Role.findOne({ role: ADMIN }).lean().exec()
    const admins = await User.find({
      role: role._id
    }).lean().exec()

    return admins.map(({ _id, firstName, lastName, email }) => ({
      id: _id,
      firstName,
      lastName,
      email
    }))
  },

  getAdmin: async (userId) => {
    const role = await Role.findOne({ role: ADMIN }).lean().exec()
    const admin = await User.findOne({
      _id: userId,
      role: role._id
    }).lean().exec()

    if (!admin) throw createError(404, USER_NOT_REGISTERED)

    return {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email
    }
  }
}

module.exports = adminService

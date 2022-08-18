const User = require('~/models/user')
const Role = require('~/models/role')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const { USER_NOT_REGISTERED } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const adminService = {
  getAdmins: async () => {
    const role = await Role.findOne({ value: ADMIN }).lean().exec()
    const admins = await User.find({
      role: role._id
    })
      .lean()
      .exec()

    return admins.map(({ _id, firstName, lastName, email }) => ({
      id: _id,
      firstName,
      lastName,
      email
    }))
  },

  getAdmin: async (userId) => {
    const role = await Role.findOne({ value: ADMIN }).lean().exec()
    const admin = await User.findOne({
      _id: userId,
      role: role._id
    })
      .lean()
      .exec()

    if (!admin) throw createError(404, USER_NOT_REGISTERED)

    const { _id: id, firstName, lastName, email, isEmailConfirmed } = admin
    return { id, firstName, lastName, email, isEmailConfirmed }
  }
}

module.exports = adminService

const User = require('~/models/user')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const { USER_NOT_REGISTERED } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const getAdmins = async (_req, res) => {
  const admins = await User.find({
    role: ADMIN
  }).lean()

  const adminsResponse = admins.map((admin) => {
    return {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email
    }
  })

  res.status(200).json({
    admins: adminsResponse
  })
}

const getAdmin = async (req, res) => {
  const userId = req.params.userId
  const admin = await User.findOne({
    _id: userId,
    role: ADMIN
  }).lean()

  if (!admin) throw createError(404, USER_NOT_REGISTERED)

  const adminResponse = {
    id: admin._id,
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email
  }

  res.status(200).json({
    admin: adminResponse
  })
}

module.exports = {
  getAdmin,
  getAdmins
}

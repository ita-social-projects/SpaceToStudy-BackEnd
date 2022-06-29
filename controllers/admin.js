const User = require('~/models/user')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const {
  errorCodes: { NOT_FOUND },
  errorMessages: { userNotRegistered }
} = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const getAdmins = async (_req, res, next) => {
  try {
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
  } catch (err) {
    next(err)
  }
}

const getAdmin = async (req, res, next) => {
  const userId = req.params.userId
  try {
    const admin = await User.findOne({
      _id: userId,
      role: ADMIN
    }).lean()

    if (!admin) throw createError(404, NOT_FOUND, userNotRegistered)

    const adminResponse = {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email
    }

    res.status(200).json({
      admin: adminResponse
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAdmin,
  getAdmins
}

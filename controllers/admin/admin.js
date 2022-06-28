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
    })
      .select('firstName lastName email')
      .lean()

    res.status(200).json({
      admins
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
    })
      .select('firstName lastName email')
      .lean()

    if (!admin) throw createError(404, NOT_FOUND, userNotRegistered)

    res.status(200).json({
      admin
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAdmin,
  getAdmins
}

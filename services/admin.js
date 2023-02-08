const User = require('~/models/user')
const { ALREADY_REGISTERED, USER_NOT_FOUND, USER_ALREADY_BLOCKED, USER_ALREADY_UNBLOCKED } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')
const { hashPassword } = require('~/utils/passwordHelper')
const {
  roles: { ADMIN }
} = require('~/consts/auth')

const adminService = {
  createAdmin: async (role, firstName, lastName, email, password, language) => {
    const admin = await User.findOne({
      email,
      role: ADMIN
    })
      .lean()
      .exec()

    if (admin) {
      throw createError(409, ALREADY_REGISTERED)
    }

    const hashedPassword = await hashPassword(password)

    const newAdmin = await User.create({
      role,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      language
    })

    return newAdmin
  },

  getAdmins: async ({
    skip = 0,
    limit = 10,
    name,
    email,
    active,
    blocked,
    createdAtFrom,
    createdAtTo,
    lastLoginFrom,
    lastLoginTo,
    sortByName,
    sortByEmail,
    sortByLastLogin,
    sortByCreatedAt
  }) => {
    const match = {
      role: ADMIN,
      name: {
        $regex: name.length > 0 ? name : '.*',
        $options: 'i'
      },
      email: {
        $regex: email.length > 0 ? email : '.*',
        $options: 'i'
      },
      active,
      blocked,
      createdAt: {
        $gte: createdAtFrom,
        $lte: createdAtTo
      },
      lastLogin: {
        $gte: lastLoginFrom,
        $lte: lastLoginTo
      }
    }

    const sort = {
      name: sortByName,
      email: sortByEmail,
      lastLogin: sortByLastLogin,
      createdAt: sortByCreatedAt
    }

    const [admins] = await User.aggregate([
      {
        $addFields: {
          name: { $concat: ['$firstName', ' ', '$lastName'] }
        }
      },
      {
        $project: {
          firstName: 0,
          lastName: 0
        }
      }
    ])
      .facet({
        items: [{ $match: match }, { $sort: sort }, { $skip: skip }, { $limit: limit }],
        calculations: [{ $match: match }, { $count: 'count' }]
      })
      .exec()

    return {
      items: admins.items,
      count: admins.calculations[0]?.count || 0
    }
  },

  getAdminById: async (id) => {
    const admin = await User.findOne({ _id: id, role: ADMIN }).lean().exec()

    if (!admin) {
      throw createError(404, USER_NOT_FOUND)
    }

    return admin
  },

  updateAdmin: async (id, updateData) => {
    const admin = await User.findOneAndUpdate({ _id: id, role: ADMIN }, updateData, { new: true }).lean().exec()

    if (!admin) {
      throw createError(404, USER_NOT_FOUND)
    }
  },

  blockAdmin: async (id) => {
    const admin = await User.findOne({ _id: id, role: ADMIN }).select('+blocked').exec()

    if (!admin) {
      throw createError(404, USER_NOT_FOUND)
    }

    if (admin.blocked) {
      throw createError(409, USER_ALREADY_BLOCKED)
    }

    admin.blocked = true
    await admin.save()
  },

  unblockAdmin: async (id) => {
    const admin = await User.findOne({ _id: id, role: ADMIN }).select('+blocked').exec()

    if (!admin) {
      throw createError(404, USER_NOT_FOUND)
    }

    if (!admin.blocked) {
      throw createError(409, USER_ALREADY_UNBLOCKED)
    }

    admin.blocked = false
    await admin.save()
  },

  deleteAdmin: async (id) => {
    const admin = await User.findOne({ _id: id, role: ADMIN }).exec()

    if (!admin) {
      throw createError(404, USER_NOT_FOUND)
    }

    await admin.delete()
  }
}

module.exports = adminService

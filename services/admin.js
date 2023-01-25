const Admin = require('~/models/admin')
const { ALREADY_REGISTERED, USER_NOT_FOUND, USER_ALREADY_BLOCKED, USER_ALREADY_UNBLOCKED } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')
const { hashPassword } = require('~/utils/passwordHelper')

const adminService = {
  createAdmin: async (role, firstName, lastName, email, password, language) => {
    const admin = await Admin.findOne({ email }).lean().exec()

    if (admin) {
      throw createError(409, ALREADY_REGISTERED)
    }

    const hashedPassword = await hashPassword(password)

    const newAdmin = await Admin.create({
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
    signUpDateFrom,
    signUpDateTo,
    lastLoginFrom,
    lastLoginTo,
    sortByName,
    sortByEmail,
    sortByLastLogin,
    sortBySignUpDate
  }) => {
    const match = {
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
      signUpDate: {
        $gte: signUpDateFrom,
        $lte: signUpDateTo
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
      signUpDate: sortBySignUpDate
    }

    const [admins] = await Admin.aggregate([
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
    const admin = await Admin.findById(id).lean().exec()

    if (!admin) {
      throw createError(404, USER_NOT_FOUND)
    }

    return admin
  },

  updateAdmin: async (id, updateData) => {
    const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true }).lean().exec()

    if (!admin) {
      throw createError(404, USER_NOT_FOUND)
    }
  },

  blockAdmin: async (id) => {
    const admin = await Admin.findById(id).exec()

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
    const admin = await Admin.findById(id).exec()

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
    const admin = await Admin.findById(id).exec()

    if (!admin) {
      throw createError(404, USER_NOT_FOUND)
    }

    await admin.delete()
  }
}

module.exports = adminService

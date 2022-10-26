const Admin = require('~/models/admin')
const { ALREADY_REGISTERED, ADMIN_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')
const emailService = require('~/services/email')
const emailSubject = require('~/consts/emailSubject')

const adminService = {
  inviteAdmins: async ({ emails, language }) => {
    const admins = []

    for (const email of emails) {
      const admin = await Admin.create({
        email,
        dateOfInvitation: Date.now()
      })
  
      await emailService.sendEmail(email, emailSubject.ADMIN_INVITATION, language, { email })

      admins.push(admin)
    }
    
    return admins
  },
  getAdmins: async ({ skip, limit }) => {
    const admins = await Admin.find({})
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()

    return admins.map(({ _id, firstName, lastName, email }) => ({
      _id,
      firstName,
      lastName,
      email,
      dateOfInvitation,
      dateOfActivation,
      lastLogin
    }))
  },

  getAdminById: async (id) => {
    const admin = await Admin.findById(id)
      .lean()
      .exec()

    if (!admin) {
      throw createError(404, ADMIN_NOT_FOUND)
    }

    const {
      _id,
      firstName,
      lastName,
      email,
      dateOfInvitation,
      dateOfActivation,
      lastLogin
    } = admin

    return {
      _id,
      firstName,
      lastName,
      email,
      dateOfInvitation,
      dateOfActivation,
      lastLogin
    }
  }
}

module.exports = adminService

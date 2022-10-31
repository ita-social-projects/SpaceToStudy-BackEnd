const Admin = require('~/models/admin')
const { ADMIN_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')
const emailService = require('~/services/email')
const emailSubject = require('~/consts/emailSubject')
const adminInvitation = require('~/models/admin-invitation')

const adminService = {
  inviteAdmins: async ({ emails, language }) => {
    const invitations = []

    for (const email of emails) {
      const invitation = await adminInvitation.create({
        email,
        dateOfInvitation: Date.now()
      })
  
      await emailService.sendEmail(email, emailSubject.ADMIN_INVITATION, language, { email })

      invitations.push(invitation)
    }
    
    return invitations
  },
  getAdmins: async ({ skip, limit }) => {
    const admins = await Admin.find({})
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()

    return admins
  },

  getAdminById: async (id) => {
    const admin = await Admin.findById(id)
      .lean()
      .exec()

    if (!admin) {
      throw createError(404, ADMIN_NOT_FOUND)
    }

    return admin
  }
}

module.exports = adminService

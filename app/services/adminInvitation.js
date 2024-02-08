const emailService = require('~/app/services/email')
const emailSubject = require('~/app/consts/emailSubject')
const AdminInvitation = require('~/app/models/adminInvitation')

const adminInvitationService = {
  sendAdminInvitations: async (emails, language) => {
    return Promise.all(
      emails.map(async (email) => {
        const invitation = await AdminInvitation.create({ email })

        await emailService.sendEmail(email, emailSubject.ADMIN_INVITATION, language, { email })

        return invitation
      })
    )
  },

  getAdminInvitations: async () => {
    return await AdminInvitation.find().lean().exec()
  }
}

module.exports = adminInvitationService

const emailService = require('~/services/email')
const emailSubject = require('~/consts/emailSubject')
const AdminInvitation = require('~/models/adminInvitation')

const adminInvitationService = {
  inviteAdmins: async (emails, language) => {
    const invitations = []

    for (const email of emails) {
      const invitation = await AdminInvitation.create({
        email,
        dateOfInvitation: Date.now()
      })
  
      await emailService.sendEmail(email, emailSubject.ADMIN_INVITATION, language, { email })

      invitations.push(invitation)
    }
    
    return invitations
  },

  getAdminInvitations: async () => {
    const adminInvitations = await AdminInvitation.find()
      .lean()
      .exec()

    return adminInvitations
  },
}

module.exports = adminInvitationService

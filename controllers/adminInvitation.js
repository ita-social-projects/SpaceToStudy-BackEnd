const adminInvitationService = require('~/services/adminInvitation')

const inviteAdmins = async (req, res) => {
  const { emails } = req.body
  const language = req.lang

  const invitations = await adminInvitationService.inviteAdmins(emails, language)

  res.status(201).json(invitations)
}

const getAdminInvitations = async (req, res) => {
  const invitations = await adminInvitationService.getAdminInvitations()

  res.status(200).json(invitations)
}

module.exports = {
  inviteAdmins,
  getAdminInvitations
}

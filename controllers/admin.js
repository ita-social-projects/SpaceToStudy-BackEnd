const adminService = require('~/services/admin')

const getAdmins = async (_req, res) => {
  const admins = await adminService.getAdmins()

  res.status(200).json({ admins })
}

const getAdmin = async (req, res) => {
  const userId = req.params.userId

  const admin = await adminService.getAdmin(userId)
  res.status(200).json({ admin })
}

module.exports = {
  getAdmin,
  getAdmins
}

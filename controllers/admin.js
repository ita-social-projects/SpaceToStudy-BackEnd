const adminService = require('~/services/admin')

const getAdmins = async (_req, res) => {
  const adminsResponse = await adminService.getAdmins()

  res.status(200).json({
    admins: adminsResponse
  })
}

const getAdmin = async (req, res) => {
  const userId = req.params.userId

  const adminResponse = await adminService.getAdmin(userId)
  res.status(200).json({
    admin: adminResponse
  })
}

module.exports = {
  getAdmin,
  getAdmins
}

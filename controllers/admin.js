const adminService = require('~/services/admin')

const inviteAdmins = async (req, res) => {
  const admins = await adminService.inviteAdmins({
    ...req.body,
    language: req.lang
  })

  res.status(201).json(admins)
}

const getAdmins = async (req, res) => {
  const { skip, limit } = req.query
  
  const admins = await adminService.getAdmins({ skip, limit })

  res.status(200).json(admins)
}

const getAdminById = async (req, res) => {
  const admin = await adminService.getAdminById(req.params.id)

  res.status(200).json(admin)
}

const updateAdmin = async (req, res) => {

}

const deleteAdmin = async (req, res) => {

}

module.exports = {
  inviteAdmins,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin
}

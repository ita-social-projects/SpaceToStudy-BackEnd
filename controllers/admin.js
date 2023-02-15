const adminService = require('~/services/admin')
const { getAdminsFilter, getAdminsSort } = require('~/utils/getAdminsQuery')

const getAdmins = async (req, res) => {
  const { skip, limit } = req.query

  const admins = await adminService.getAdmins({
    skip: parseInt(skip),
    limit: parseInt(limit),
    ...getAdminsFilter(req.query),
    ...getAdminsSort(req.query)
  })

  res.status(200).json(admins)
}

const getAdminById = async (req, res) => {
  const { id } = req.params

  const admin = await adminService.getAdminById(id)

  res.status(200).json(admin)
}

const updateAdmin = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  await adminService.updateAdmin(id, updateData)

  res.status(204).end()
}

const blockAdmin = async (req, res) => {
  const { id } = req.params

  await adminService.blockAdmin(id)

  res.status(204).end()
}

const unblockAdmin = async (req, res) => {
  const { id } = req.params

  await adminService.unblockAdmin(id)

  res.status(204).end()
}

const deleteAdmin = async (req, res) => {
  const { id } = req.params

  await adminService.deleteAdmin(id)

  res.sendStatus(204)
}

module.exports = {
  getAdmins,
  getAdminById,
  updateAdmin,
  blockAdmin,
  unblockAdmin,
  deleteAdmin
}

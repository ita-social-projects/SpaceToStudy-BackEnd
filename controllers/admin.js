const adminService = require('~/services/admin')

const getAdmins = async (req, res) => {
  const {
    skip,
    limit,
    name,
    email,
    active,
    blocked,
    createdAtFrom,
    createdAtTo,
    lastLoginFrom,
    lastLoginTo,
    sortByName,
    sortByEmail,
    sortByLastLogin,
    sortBySignUpDate
  } = req.query

  const admins = await adminService.getAdmins({
    skip: parseInt(skip),
    limit: parseInt(limit),
    name,
    email,
    active: Boolean(parseInt(active)),
    blocked: Boolean(parseInt(blocked)),
    createdAtFrom: new Date(createdAtFrom),
    createdAtTo: new Date(createdAtTo),
    lastLoginFrom: new Date(lastLoginFrom),
    lastLoginTo: new Date(lastLoginTo),
    sortByName: parseInt(sortByName),
    sortByEmail: parseInt(sortByEmail),
    sortByLastLogin: parseInt(sortByLastLogin),
    sortBySignUpDate: parseInt(sortBySignUpDate)
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

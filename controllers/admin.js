const adminService = require('~/services/admin')

const inviteAdmins = async (req, res) => {
  const admins = await adminService.inviteAdmins({
    ...req.body,
    language: req.lang
  })

  res.status(201).json(admins)
}

<<<<<<< HEAD
const getInvitations = async (req, res) => {
  const invitations = await adminService.getInvitations()

  res.status(200).json(invitations)
}

const getAdmins = async (req, res) => {
  const {
    skip,
    limit,
    name,
    email,
    active,
    blocked,
    signUpDateFrom,
    signUpDateTo,
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
    signUpDateFrom: new Date(signUpDateFrom),
    signUpDateTo: new Date(signUpDateTo),
    lastLoginFrom: new Date(lastLoginFrom),
    lastLoginTo: new Date(lastLoginTo),
    sortByName: parseInt(sortByName),
    sortByEmail: parseInt(sortByEmail),
    sortByLastLogin: parseInt(sortByLastLogin),
    sortBySignUpDate: parseInt(sortBySignUpDate)
  })

=======
const getAdmins = async (req, res) => {
  const { skip, limit } = req.query
  
  const admins = await adminService.getAdmins({ skip, limit })

>>>>>>> a620641 (Implemented admin service)
  res.status(200).json(admins)
}

const getAdminById = async (req, res) => {
<<<<<<< HEAD
  const { id } = req.params

  const admin = await adminService.getAdminById(id)

=======
  const admin = await adminService.getAdminById(req.params.id)

>>>>>>> a620641 (Implemented admin service)
  res.status(200).json(admin)
}

const updateAdmin = async (req, res) => {

}

const blockAdmin = async (req, res) => {
  const { id } = req.params

  const admin = await adminService.blockAdmin(id)

  res.status(200).json(admin)
}

const unblockAdmin = async (req, res) => {
  const { id } = req.params

  const admin = await adminService.unblockAdmin(id)

  res.status(200).json(admin)
}

const deleteAdmin = async (req, res) => {
  const { id } = req.params

  await adminService.deleteAdmin(id)

  res.sendStatus(204)
}

module.exports = {
  inviteAdmins,
  getAdmins,
  getInvitations,
  getAdminById,
  updateAdmin,
  blockAdmin,
  unblockAdmin,
  deleteAdmin
}

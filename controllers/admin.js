const adminService = require('~/services/admin')

const inviteAdmins = async (req, res) => {
  const admins = await adminService.inviteAdmins({
    ...req.body,
    language: req.lang
  })

  res.status(201).json(admins)
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 641577f (Implemented getInvitations)
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

>>>>>>> a620641 (Implemented admin service)
  res.status(200).json(admins)
}

const getAdminById = async (req, res) => {
<<<<<<< HEAD
<<<<<<< HEAD
  const { id } = req.params

  const admin = await adminService.getAdminById(id)

=======
  const admin = await adminService.getAdminById(req.params.id)
=======
  const { id } = req.params

  const admin = await adminService.getAdminById(id)
>>>>>>> 641577f (Implemented getInvitations)

>>>>>>> a620641 (Implemented admin service)
  res.status(200).json(admin)
}

const updateAdmin = async (req, res) => {

}

const blockAdmin = async (req, res) => {
<<<<<<< HEAD
<<<<<<< HEAD
  const { id } = req.params

  const admin = await adminService.blockAdmin(id)
=======
  const admin = await adminService.blockAdmin(req.params.id)
>>>>>>> b2626a3 (Implemented block, unblock and delete for admin)
=======
  const { id } = req.params

  const admin = await adminService.blockAdmin(id)
>>>>>>> 641577f (Implemented getInvitations)

  res.status(200).json(admin)
}

const unblockAdmin = async (req, res) => {
<<<<<<< HEAD
<<<<<<< HEAD
  const { id } = req.params

  const admin = await adminService.unblockAdmin(id)
=======
  const admin = await adminService.unblockAdmin(req.params.id)
>>>>>>> b2626a3 (Implemented block, unblock and delete for admin)
=======
  const { id } = req.params

  const admin = await adminService.unblockAdmin(id)
>>>>>>> 641577f (Implemented getInvitations)

  res.status(200).json(admin)
}

const deleteAdmin = async (req, res) => {
<<<<<<< HEAD
<<<<<<< HEAD
  const { id } = req.params

  await adminService.deleteAdmin(id)
=======
  await adminService.deleteAdmin(req.params.id)
>>>>>>> b2626a3 (Implemented block, unblock and delete for admin)
=======
  const { id } = req.params

  await adminService.deleteAdmin(id)
>>>>>>> 641577f (Implemented getInvitations)

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

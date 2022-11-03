const adminService = require('~/services/admin')

const inviteAdmins = async (req, res) => {
  const admins = await adminService.inviteAdmins({
    ...req.body,
    language: req.lang
  })

  res.status(201).json(admins)
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

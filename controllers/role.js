const roleService = require('~/services/role')

const createRole = async (req, res) => {
  const { value } = req.body

  const newRole = await roleService.createRole(value)

  res.status(201).json(newRole)
}

const getRoleByValue = async (req, res) => {
  const { value } = req.params

  const role = await roleService.getRoleByValue(value)

  res.status(200).json(role)
}

module.exports = {
  getRoleByValue,
  createRole
}

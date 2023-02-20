const userService = require('~/services/user')
const createAgregateOptions = require('~/utils/createAgregateOptions')

const getUsers = async (req, res) => {
  const { skip, limit, sort, match } = createAgregateOptions(req.query)

  const users = await userService.getUsers({ skip, limit, sort, match })

  res.status(200).json(users)
}

const getUserById = async (req, res) => {
  const { id } = req.params

  const user = await userService.getUserById(id)

  res.status(200).json(user)
}

const deleteUser = async (req, res) => {
  const { id } = req.params

  await userService.deleteUser(id)

  res.status(204).end()
}

module.exports = {
  getUsers,
  getUserById,
  deleteUser
}

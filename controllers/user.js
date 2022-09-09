const userService = require('~/services/user')

const getUsers = async (_req, res) => {
  const users = await userService.getUsers()

  res.status(200).json(users)
}

const getUserById = async (req, res) => {
  const { userId } = req.params

  const user = await userService.getUserById(userId)

  res.status(200).json(user)
}

const deleteUser = async (req, res) => {
  const { userId } = req.params

  await userService.deleteUser(userId)

  res.status(204).end()
}

module.exports = {
  getUsers,
  getUserById,
  deleteUser
}

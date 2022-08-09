const userService = require('~/services/user')

const getUsers = async (_req, res) => {
  const users = await userService.getUsers()

  res.status(200).json({ users })
}

const getUser = async (req, res) => {
  const userId = req.params.userId

  const user = await userService.getUser(userId)

  res.status(200).json({ user })
}

const deleteUser = async (req, res) => {
  const userId = req.params.userId

  await userService.deleteUser(userId)

  res.status(204).json()
}

module.exports = {
  getUsers,
  getUser,
  deleteUser
}

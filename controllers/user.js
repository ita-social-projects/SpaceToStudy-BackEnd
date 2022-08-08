const userService = require('~/services/user')

const getUsers = async (_req, res) => {
  const usersResponse = await userService.getUsers()

  res.status(200).json({
    users: usersResponse
  })
}

const getUser = async (req, res) => {
  const userId = req.params.userId

  const userResponse = await userService.getUser(userId)

  res.status(200).json({
    user: userResponse
  })
}

const deleteUser = async (req, res) => {
  const userId = req.params.userId

  await userService.deleteUser(userId)

  res.status(200).json({ message: 'User deleted.' })
}

module.exports = {
  getUsers,
  getUser,
  deleteUser
}

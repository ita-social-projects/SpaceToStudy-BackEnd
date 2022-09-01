const userService = require('~/services/user')
const { USER_NOT_FOUND } = require('~/consts/errors')

const getUsers = async (_req, res) => {
  const users = await userService.getUsers()

  res.status(200).json(users)
}

const getUserById = async (req, res) => {
  const { userId } = req.params

  const user = await userService.getUserById(userId)

  if (!user) {
    return void res.status(404).json(USER_NOT_FOUND)
  }

  res.status(200).json(user)
}

const getUserByParam = async (req, res) => {
  const { param } = req.params

  const user = await userService.getUserByParam(param)

  if (!user) {
    return void res.status(404).json(USER_NOT_FOUND)
  }

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
  getUserByParam,
  deleteUser
}

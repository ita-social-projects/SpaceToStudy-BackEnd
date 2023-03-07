const userService = require('~/services/user')
const createAggregateOptions = require('~/utils/users/createAggregateOptions')

const getUsers = async (req, res) => {
  const { skip, limit, sort, match } = createAggregateOptions(req.query)

  const users = await userService.getUsers({ skip, limit, sort, match })

  res.status(200).json(users)
}

const getOneUser = async (req, res) => {
  const { id, role } = req.params

  const user = await userService.getOneUser(id, role)

  res.status(200).json({ user })
}

const deleteUser = async (req, res) => {
  const { id } = req.params

  await userService.deleteUser(id)

  res.status(204).end()
}

module.exports = {
  getUsers,
  getOneUser,
  deleteUser
}

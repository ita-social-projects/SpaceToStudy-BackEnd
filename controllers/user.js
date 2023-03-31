<<<<<<< HEAD
const userService = require('~/services/user')
const createAggregateOptions = require('~/utils/users/createAggregateOptions')

const getUsers = async (req, res) => {
  const { skip, limit, sort, match } = createAggregateOptions(req.query)

  const users = await userService.getUsers({ skip, limit, sort, match })

  res.status(200).json(users)
}

const getUserById = async (req, res) => {
  const { id } = req.params
  const { role } = req.query

  const user = await userService.getUserById(id, role)

  res.status(200).json(user)
}

const updateUser = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  await userService.updateUser(id, updateData)

  res.status(204).end()
}

const deleteUser = async (req, res) => {
  const { id } = req.params

  await userService.deleteUser(id)

  res.status(204).end()
}

module.exports = {
  getUsers,
  getUserById,
  deleteUser,
  updateUser
}
=======
const userService = require('~/services/user')
const createAggregateOptions = require('~/utils/users/createAggregateOptions')

const getUsers = async (req, res) => {
  const { skip, limit, sort, match } = createAggregateOptions(req.query)

  const users = await userService.getUsers({ skip, limit, sort, match })

  res.status(200).json(users)
}

const getOneUser = async (req, res) => {
  const { id } = req.params
  const { role } = req.query

  const user = await userService.getOneUser(id, role)

  res.status(200).json(user)
}

const updateStatus = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  await userService.updateStatus(id, updateData)
  
  res.status(204).end()
}

const updateUser = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  await userService.updateUser(id, updateData)

  res.status(204).end()
}

const deleteUser = async (req, res) => {
  const { id } = req.params

  await userService.deleteUser(id)

  res.status(204).end()
}

module.exports = {
  getUsers,
  getOneUser,
  deleteUser,
  updateUser,
  updateStatus
}
>>>>>>> a11e7ab (update some routes)

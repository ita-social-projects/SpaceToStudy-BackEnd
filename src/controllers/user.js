const userService = require('~/services/user')
const { createForbiddenError } = require('~/utils/errorsHelper')
const createAggregateOptions = require('~/utils/users/createAggregateOptions')
const {
  enums: { STATUS_ENUM }
} = require('~/consts/validation')
const parseBoolean = require('~/utils/parseBoolean')
const validateUserToken = require('~/utils/users/tokenValidation')

const getUsers = async (req, res) => {
  const { skip, limit, sort, match } = createAggregateOptions(req.query)

  const users = await userService.getUsers({ skip, limit, sort, match })

  res.status(200).json(users)
}

const getUserById = async (req, res) => {
  const { id } = req.params
  const { role, isEdit } = req.query

  const user = await userService.getUserById(id, role, parseBoolean(isEdit))

  res.status(200).json(user)
}

const updateUser = async (req, res) => {
  const { id } = req.params
  const { role } = req.user
  const updateData = req.body

  if (id !== req.user.id) throw createForbiddenError()

  await userService.updateUser(id, role, updateData)

  res.status(204).end()
}

const updateStatus = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  await userService.updateStatus(id, updateData)

  res.status(204).end()
}

const deleteUser = async (req, res) => {
  const { id } = req.params

  await userService.deleteUser(id)

  res.status(204).end()
}

const deactivateUser = async (req, res) => {
  const { role, id: currentUserId } = req.user
  const { id } = req.params

  if (id !== currentUserId) throw createForbiddenError()

  const DEACTIVATED_STATUS = STATUS_ENUM[2]
  await userService.updateStatus(id, { [role]: DEACTIVATED_STATUS })

  res.status(204).end()
}

const blockUser = async (req, res) => {
  const { role, id: currentUserId } = req.user
  const { id } = req.params

  if (id !== currentUserId) throw createForbiddenError()

  const BLOCKED_STATUS = STATUS_ENUM[1]
  await userService.updateStatus(id, { [role]: BLOCKED_STATUS })

  res.status(204).end()
}

const activateUser = async (req, res) => {
  const { role, id: currentUserId } = req.user
  const { id } = req.params

  if (id !== currentUserId) throw createForbiddenError()

  const ACTIVE_STATUS = STATUS_ENUM[0]
  await userService.updateStatus(id, { [role]: ACTIVE_STATUS })

  res.status(204).end()
}

const toggleOfferBookmark = async (req, res) => {
  const { id: userId, offerId } = req.params

  if (!validateUserToken(req, res)) return

  const newBookmarks = await userService.toggleOfferBookmark(offerId, userId)

  res.status(200).json(newBookmarks)
}

const getBookmarkedOffers = async (req, res) => {
  if (!validateUserToken(req, res)) return

  const response = await userService.getBookmarkedOffers(req.params.id, req.query)

  res.status(200).json(response)
}

module.exports = {
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateStatus,
  deactivateUser,
  blockUser,
  activateUser,
  toggleOfferBookmark,
  getBookmarkedOffers
}

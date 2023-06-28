const cooperationService = require('~/services/cooperation')
const coopsAggregateOptions = require('~/utils/cooperations/coopsAggregateOptions')

const getCooperations = async (req, res) => {
  const pipeline = coopsAggregateOptions(req.user, req.query)

  const cooperations = await cooperationService.getCooperations(pipeline)

  res.status(200).json(cooperations)
}

const getCooperationById = async (req, res) => {
  const { id } = req.params

  const cooperation = await cooperationService.getCooperationById(id)

  res.status(200).json(cooperation)
}

const createCooperation = async (req, res) => {
  const { id: initiator, role: initiatorRole } = req.user
  const data = req.body

  const newCooperation = await cooperationService.createCooperation(initiator, initiatorRole, data)

  res.status(201).json(newCooperation)
}

const updateCooperation = async (req, res) => {
  const { id } = req.params
  const updateData = req.body
  const currentUser = req.user

  await cooperationService.updateCooperation(id, currentUser, updateData)

  res.status(204).end()
}

module.exports = {
  getCooperations,
  getCooperationById,
  createCooperation,
  updateCooperation
}

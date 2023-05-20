const cooperationService = require('~/services/cooperation')
const coopsAggregateOptions = require('~/utils/cooperations/coopsAggregateOptions')

const getCooperations = async (req, res) => {
<<<<<<< HEAD
  const { skip, limit, match, sortOptions } = coopsAggregateOptions(req.query)

  const cooperations = await cooperationService.getCooperations({ skip, limit, match, sortOptions })
=======
  const { skip, limit, sort, match } = coopsAggregateOptions(req.params, req.query)

  const cooperations = await cooperationService.getCooperations({
    skip,
    limit,
    match,
    sort
  })
>>>>>>> 42e662d (added separate function)

  res.status(200).json(cooperations)
}

const getCooperationById = async (req, res) => {
  const { id } = req.params

  const cooperation = await cooperationService.getCooperationById(id)

  res.status(200).json(cooperation)
}

const createCooperation = async (req, res) => {
  const { id: initiatorUserId } = req.user
  const data = req.body

  const newCooperation = await cooperationService.createCooperation(initiatorUserId, data)

  res.status(201).json(newCooperation)
}

const updateCooperation = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  await cooperationService.updateCooperation(id, updateData)

  res.status(204).end()
}

module.exports = {
  getCooperations,
  getCooperationById,
  createCooperation,
  updateCooperation
}

const cooperationService = require('~/services/cooperation')

const getCooperations = async (res) => {
  const cooperations = await cooperationService.getCooperations()

  res.status(200).json(cooperations)
}

const getCooperationById = async (req, res) => {
  const { id } = req.params

  const cooperation = await cooperationService.getCooperationById(id)

  res.status(200).json(cooperation)
}

const createCooperation = async (req, res) => {
  const { offerId, tutorId, studentId, price, cooperationStatus } = req.body

  const newCooperation = await cooperationService.createCooperation({
    offerId,
    tutorId,
    studentId,
    price,
    cooperationStatus
  })

  res.status(201).json(newCooperation)
}

const deleteCooperation = async (req, res) => {
  const { id } = req.params

  await cooperationService.deleteCooperation(id)

  res.status(204).end()
}

module.exports = {
  getCooperations,
  getCooperationById,
  createCooperation,
  deleteCooperation
}

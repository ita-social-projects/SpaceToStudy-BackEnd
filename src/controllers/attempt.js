const attemptService = require('~/services/attempt')
const getAttempts = async (req, res) => {
  const { skip, limit } = req.query
  const { id: author } = req.user

  const attempts = await attemptService.getAttempt(author, skip, limit)

  res.status(200).json(attempts)
}

const createAttempt = async (req, res) => {
  const data = req.body

  const newAttempt = await attemptService.createAttempt(data)

  res.status(201).json(newAttempt)
}

const getAttemptById = async (req, res) => {
  const { id } = req.params

  const attempt = await attemptService.getAttemptById(id)

  res.status(200).json(attempt)
}

const getAttemptByQuizId = async (req, res) => {
  const { quizId, cooperationId } = req.params

  const attempts = await attemptService.getAttemptByQuizId(quizId, cooperationId)

  res.status(200).json(attempts)
}

const updateAttempt = async (req, res) => {
  const { id } = req.params

  const { role } = req.user

  const updateData = req.body

  await attemptService.updateAttempt(id, updateData, role)

  res.status(204).end()
}

module.exports = {
  getAttempts,
  createAttempt,
  getAttemptById,
  getAttemptByQuizId,
  updateAttempt
}

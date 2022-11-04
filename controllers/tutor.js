const tutorService = require('~/services/tutor')

const getTutors = async (_req, res) => {
  const tutors = await tutorService.getTutors()

  res.status(200).json(tutors)
}

const getTutorById = async (req, res) => {
  const { id } = req.params

  const tutor = await tutorService.getTutorById(id)

  res.status(200).json(tutor)
}

const updateTutor = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  await tutorService.updateTutor(id, updateData)

  res.status(204).end()
}

const deleteTutor = async (req, res) => {
  const { id } = req.params

  await tutorService.deleteTutor(id)

  res.status(204).end()
}

module.exports = {
  getTutors,
  getTutorById,
  updateTutor,
  deleteTutor
}

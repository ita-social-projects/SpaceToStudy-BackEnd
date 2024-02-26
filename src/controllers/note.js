const noteService = require('~/services/note')

const addNote = async (req, res) => {
  const { id: author } = req.user
  const { id: cooperationId } = req.params
  const data = req.body

  const note = await noteService.addNote(data, author, cooperationId)

  res.status(201).json(note)
}

const getNotes = async (req, res) => {
  const { id: userId } = req.user
  const { id: cooperationId } = req.params

  const notes = await noteService.getNotes(cooperationId, userId)

  res.status(200).json(notes)
}

const updateNote = async (req, res) => {
  const { id: userId } = req.user
  const { id: cooperationId, noteId } = req.params
  const updateData = req.body

  await noteService.updateNote(updateData, cooperationId, userId, noteId)

  res.status(204).end()
}

const deleteNote = async (req, res) => {
  const { id: userId } = req.user
  const { id: cooperationId, noteId } = req.params

  await noteService.deleteNote(cooperationId, userId, noteId)

  res.status(204).end()
}

module.exports = {
  addNote,
  getNotes,
  updateNote,
  deleteNote
}

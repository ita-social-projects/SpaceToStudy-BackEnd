const commentService = require('~/services/comment')

const addComment = async (req, res) => {
  const { id: author, role: authorRole } = req.user
  const data = req.body
  const { id: cooperationId } = req.params

  const comment = await commentService.addComment({ text: data.text, author, authorRole, cooperationId })

  res.status(201).json(comment)
}

const getComments = async (req, res) => {
  const { id } = req.user
  const { id: cooperationId } = req.params

  const comments = await commentService.getComments(cooperationId, id)

  res.status(200).json(comments)
}

module.exports = {
  addComment,
  getComments
}

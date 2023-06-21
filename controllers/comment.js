const commentService = require('~/services/comment')

const createComment = async (req, res) => {
  const { id: author } = req.user
  const data = req.body
  const { id: cooperationId } = req.params

  const comment = await commentService.createComment({ text: data.text, author, cooperationId })

  res.status(201).json(comment)
}

const getComments = async (req, res) => {
  const { id } = req.user
  const { id: cooperationId } = req.params

  const comments = await commentService.getComments(cooperationId, id)

  res.status(200).json(comments)
}

module.exports = {
  createComment,
  getComments
}

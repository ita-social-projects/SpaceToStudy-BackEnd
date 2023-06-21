const commentService = require('~/services/comment')

const create = async (req,res) => {
  const { id: author } = req.user
  const data = req.body

  const comment = await commentService.create({ ...data, author })

  res.status(201).json(comment)
}

const getAll = async (req,res) => {
  const { id } = req.user

  const { cooperationId } = req.params

  const comments = await commentService.getAll(cooperationId, id)

  res.status(200).json(comments)
}

module.exports = {
  create,
  getAll
}

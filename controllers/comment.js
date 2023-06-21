const commentService = require('~/services/comment')

const create = async (req,res) => {
  const data = req.body

  const comment = await commentService.create(data)

  res.status(201).json(comment)
}

const getAll = async (req,res) => {
  const { id } = req.user

  console.log(id)
  const { cooperationId } = req.params

  const comments = await commentService.getAll(cooperationId)

  res.status(200).json(comments)
}

module.exports = {
  create,
  getAll
}

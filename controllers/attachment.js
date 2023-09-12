const attachmentService = require('~/services/attachment')

const getMatchOptions = require('~/utils/getMatchOptions')
const getSortOptions = require('~/utils/getSortOptions')
const getRegex = require('~/utils/getRegex')

const getAttachments = async (req, res) => {
  const { id: author } = req.user
  const { fileName, sort, skip, limit } = req.query

  const match = getMatchOptions({ author, fileName: getRegex(fileName) })
  const sortOptions = getSortOptions(sort)

  const attachments = await attachmentService.getAttachments(match, sortOptions, parseInt(skip), parseInt(limit))

  res.status(200).json(attachments)
}

const createAttachments = async (req, res) => {
  const { id: author } = req.user
  const { description } = req.body
  const files = req.files

  const attachments = await attachmentService.createAttachments({ author, files, description })

  res.status(201).json(attachments)
}

const updateAttachment = async (req, res) => {
  const { id } = req.params
  const { id: currentUser } = req.user
  const { fileName } = req.body

  await attachmentService.updateAttachment(id, currentUser, fileName)

  res.status(204).end()
}

const deleteAttachment = async (req, res) => {
  const { id } = req.params
  const { id: currentUser } = req.user

  await attachmentService.deleteAttachment(id, currentUser)

  res.status(204).end()
}

module.exports = {
  getAttachments,
  createAttachments,
  updateAttachment,
  deleteAttachment
}

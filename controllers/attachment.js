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

const deleteAttachment = async (req, res) => {
  const { id } = req.params
  const { id: currentUser } = req.user

  await attachmentService.deleteAttachment(id, currentUser)

  res.status(204).end()
}

module.exports = {
  getAttachments,
  deleteAttachment
}

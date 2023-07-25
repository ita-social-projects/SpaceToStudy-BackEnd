const attachmentService = require('~/services/attachment')
const getMatchOptions = require('~/utils/getMatchOptions')

const getAttachments = async (req, res) => {
  const { id: author } = req.user
  const { fileName, sort, skip, limit } = req.query

  const match = getMatchOptions({ author, fileName })

  const attachments = await attachmentService.getAttachments(match, sort, parseInt(skip), parseInt(limit))

  res.status(200).json(attachments)
}

const deleteAttachment = async (req, res) => {
  const { id: attachment } = req.params
  const { id: currentUser } = req.user

  await attachmentService.deleteAttachment(attachment, currentUser)

  res.status(204).end()
}

module.exports = {
  getAttachments,
  deleteAttachment
}

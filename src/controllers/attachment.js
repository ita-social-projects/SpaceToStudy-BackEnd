const iconv = require('iconv-lite')
const attachmentService = require('~/services/attachment')

const getMatchOptions = require('~/utils/getMatchOptions')
const getSortOptions = require('~/utils/getSortOptions')
const getRegex = require('~/utils/getRegex')
const getCategoriesOptions = require('~/utils/getCategoriesOption')
const parseBoolean = require('~/utils/parseBoolean')

const getAttachments = async (req, res) => {
  const { id: author } = req.user
  const { fileName, sort, skip, limit, categories, includeDuplicates } = req.query
  const categoriesOptions = getCategoriesOptions(categories)

  const match = getMatchOptions({
    author,
    fileName: getRegex(fileName),
    category: categoriesOptions,
    isDuplicate: parseBoolean(includeDuplicates) ? null : { $ne: true }
  })
  const sortOptions = getSortOptions(sort)

  const attachments = await attachmentService.getAttachments(match, sortOptions, parseInt(skip), parseInt(limit))

  res.status(200).json(attachments)
}

const createAttachments = async (req, res) => {
  const { id: author } = req.user
  const { description } = req.body
  const files = req.files.map((file) => ({
    ...file,
    originalname: iconv.decode(Buffer.from(file.originalname, 'binary'), 'utf-8')
  }))
  const attachments = await attachmentService.createAttachments({ author, files, description })

  res.status(201).json(attachments)
}

const updateAttachment = async (req, res) => {
  const { id } = req.params
  const { id: currentUser } = req.user
  const updateData = req.body

  const attachment = await attachmentService.updateAttachment(id, currentUser, updateData)

  res.status(200).json(attachment).end()
}

const deleteAttachment = async (req, res) => {
  const { id } = req.params
  const { id: currentUser } = req.user

  await attachmentService.deleteAttachmentById(id, currentUser)

  res.status(204).end()
}

module.exports = {
  getAttachments,
  createAttachments,
  updateAttachment,
  deleteAttachment
}

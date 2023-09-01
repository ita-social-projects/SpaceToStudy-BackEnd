const Attachment = require('~/models/attachment')
const { createForbiddenError } = require('~/utils/errorsHelper')
const uploadService = require('~/services/upload')
const { ATTACHMENT } = require('~/consts/upload')

const attachmentService = {
  getAttachments: async (match, sort, skip, limit) => {
    const items = await Attachment.find(match).sort(sort).skip(skip).limit(limit).exec()
    const count = await Attachment.countDocuments(match)

    return { count, items }
  },

  createAttachments: async ({ author, files, description }) => {
    return await Promise.all(
      files.map(async (file) => {
        const { originalname, buffer, size } = file

        const link = await uploadService.uploadFile(originalname, buffer, ATTACHMENT)

        return await Attachment.create({ author, fileName: originalname, link, description, size })
      })
    )
  },

  deleteAttachment: async (id, currentUser) => {
    const item = await Attachment.findById(id).exec()

    const attachmentAuthor = item.author.toString()

    if (attachmentAuthor !== currentUser) {
      throw createForbiddenError()
    }

    await Attachment.findByIdAndRemove(id).exec()
  }
}

module.exports = attachmentService

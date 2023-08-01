const Attachment = require('~/models/attachment')
const { createForbiddenError } = require('~/utils/errorsHelper')

const attachmentService = {
  getAttachments: async (match, sort, skip, limit) => {
    const items = await Attachment.find(match).sort(sort).skip(skip).limit(limit).exec()
    const count = await Attachment.countDocuments(match)

    return { count, items }
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

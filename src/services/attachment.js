const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const Attachment = require('~/models/attachment')
const { createForbiddenError, createError } = require('~/utils/errorsHelper')
const uploadService = require('~/services/upload')
const { ATTACHMENT } = require('~/consts/upload')
const resourceType = require('~/consts/resourceType')
const refs = require('~/consts/models')
const checkIdValidity = require('~/utils/checkIdValidity')

const cooperationService = require('./cooperation')
const resourcesCategoryService = require('./resourcesCategory')

const attachmentService = {
  getAttachments: async (match, sort, skip, limit) => {
    const items = await Attachment.find(match)
      .collation({ locale: 'en', strength: 1 })
      .populate({ path: 'category', select: '_id name' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec()
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

  updateAttachment: async (id, currentUser, updateData) => {
    const { fileName, description, category } = updateData

    const attachment = await Attachment.findById(id).exec()

    if (!attachment) {
      throw createError(404, DOCUMENT_NOT_FOUND(attachment.modelName))
    }

    if (currentUser !== attachment.author.toString()) {
      throw createForbiddenError()
    }

    if (category === null) {
      attachment.category = category
    }

    if (category && typeof category === 'string') {
      checkIdValidity(category)

      const resourceCategoryEntity = await resourcesCategoryService.getResourcesCategoryById(category)

      if (!resourceCategoryEntity) {
        throw createError(404, DOCUMENT_NOT_FOUND(refs.RESOURCES_CATEGORY))
      }

      attachment.category = category
    }

    if (fileName) {
      const [fileExtension] = attachment.fileName.split('.').reverse()
      const newFileName = `${fileName}.${fileExtension}`

      attachment.fileName = newFileName

      await attachment.validate()

      const newLink = await uploadService.updateFile(attachment.link, newFileName, ATTACHMENT)

      attachment.link = newLink
    }

    if (description !== undefined) {
      attachment.description = description
    }

    await attachment.validate()
    await attachment.save()
    return attachment.populate({ path: 'category', select: '_id name' })
  },

  deleteAttachmentById: async (id, currentUser) => {
    const item = await Attachment.findById(id).exec()

    const attachmentAuthor = item.author.toString()

    if (attachmentAuthor !== currentUser) {
      throw createForbiddenError()
    }

    await cooperationService.removeResourceFromCooperations(id, resourceType.ATTACHMENT, currentUser)

    await Attachment.findByIdAndRemove(id)
  },

  deleteAttachementsByAuthor: async (author) => {
    await Attachment.deleteMany({ author })
  }
}

module.exports = attachmentService

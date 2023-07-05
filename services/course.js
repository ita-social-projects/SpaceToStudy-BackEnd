const Course = require('~/models/course')

const { ATTACHMENT } = require('~/consts/upload')
const uploadService = require('~/services/upload')
const { createForbiddenError } = require('~/utils/errorsHelper')

const courseService = {
  updateCourse: async (userId, data) => {
    const {
      id,
      title,
      description,
      attachments,
      rewriteAttachments = false
    } = data

    const course = await Course.findById(id).exec()

    const courseAuthor = course.author.toString()

    if (userId !== courseAuthor) {
      createForbiddenError()
    }

    if(attachments.length) {
      const urls = await Promise.all(
        attachments.map(async (file) => {
          return await uploadService.uploadFile(file, ATTACHMENT)
        })
      )
        
      if(rewriteAttachments) course.attachments = urls
      else course.attachments.concat(urls)
    }
    
    const updateData = { title, description }

    for (const key in updateData) {
      const value = updateData[key]
      if(value) course[key] = value
    }

    await course.validate()
    await course.save()
  }
}

module.exports = courseService

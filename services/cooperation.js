const Cooperation = require('~/models/cooperation')
const mergeArraysUniqueValues = require('~/utils/mergeArraysUniqueValues')
const removeArraysUniqueValues = require('~/utils/removeArraysUniqueValues')
const { createError, createForbiddenError } = require('~/utils/errorsHelper')
const { VALIDATION_ERROR, DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const cooperationService = {
  getCooperations: async (pipeline) => {
    const [result] = await Cooperation.aggregate(pipeline).exec()

    return result
  },

  getCooperationById: async (id, pipeline) => {
    return await (await Cooperation.findById(id)).populate({
      path: 'offer',
      populate: [
        {
          path: 'category',
          select: ['name', 'appearance']
        },
        {
          path: 'subject',
          select: 'name'
        }
      ],
      select: ['id', 'author', 'category', 'subject']
    })
  },

  createCooperation: async (initiator, initiatorRole, data) => {
    const { offer, proficiencyLevel, additionalInfo, receiver, receiverRole, price, title, sections } = data

    return await Cooperation.create({
      initiator,
      initiatorRole,
      receiver,
      receiverRole,
      title,
      offer,
      sections,
      price,
      proficiencyLevel,
      additionalInfo,
      needAction: receiverRole
    })
  },

  updateCooperation: async (id, currentUser, updateData) => {
    const { id: currentUserId, role: currentUserRole } = currentUser
    const { price, status, availableQuizzes, finishedQuizzes, sections } = updateData

    if (price && status) {
      throw createError(409, VALIDATION_ERROR('You can change only either the status or the price in one operation'))
    }

    const cooperation = await Cooperation.findById(id).exec()
    if (!cooperation) {
      throw createError(DOCUMENT_NOT_FOUND(Cooperation.modelName))
    }

    const initiator = cooperation.initiator.toString()
    const receiver = cooperation.receiver.toString()

    if (initiator !== currentUserId && receiver !== currentUserId) {
      throw createForbiddenError()
    }

    if (price) {
      if (currentUserRole !== cooperation.needAction.toString()) {
        throw createForbiddenError()
      }
      const updatedNeedAction = cooperation.needAction.toString() === 'student' ? 'tutor' : 'student'

      await Cooperation.findByIdAndUpdate(id, { price, needAction: updatedNeedAction }).exec()
    }
    if (status) {
      await Cooperation.findByIdAndUpdate(id, { status }).exec()
    }
    if (sections) {
      cooperation.sections = sections

      await cooperation.validate()
      await cooperation.save()
    }
    if (availableQuizzes) {
      cooperation.availableQuizzes = mergeArraysUniqueValues(cooperation.availableQuizzes, availableQuizzes)
      await cooperation.save()
    }
    if (finishedQuizzes) {
      cooperation.finishedQuizzes = mergeArraysUniqueValues(cooperation.finishedQuizzes, finishedQuizzes)
      cooperation.availableQuizzes = removeArraysUniqueValues(cooperation.availableQuizzes, cooperation.finishedQuizzes)
      await cooperation.save()
    }
  }
}

module.exports = cooperationService

const mongoose = require('mongoose')
const Cooperation = require('~/models/cooperation')
const mergeArraysUniqueValues = require('~/utils/mergeArraysUniqueValues')
const removeArraysUniqueValues = require('~/utils/removeArraysUniqueValues')
const handleResources = require('~/utils/handleResources')
const { createError, createForbiddenError } = require('~/utils/errorsHelper')
const { VALIDATION_ERROR, DOCUMENT_NOT_FOUND, ROLE_REQUIRED_FOR_ACTION } = require('~/consts/errors')
const { roles } = require('~/consts/auth')
const {
  enums: { COOPERATION_STATUS_ENUM }
} = require('~/consts/validation')

const cooperationService = {
  _validateCooperationUser: (cooperation, userId) => {
    const initiator = cooperation.initiator.toString()
    const receiver = cooperation.receiver.toString()

    if (initiator !== userId && receiver !== userId) {
      throw createForbiddenError()
    }
  },

  getCooperations: async (pipeline) => {
    const [result] = await Cooperation.aggregate(pipeline).exec()
    return result
  },

  getCooperationById: async function (id, userRole) {
    const isStudent = userRole === roles.STUDENT

    const cooperationById = await (isStudent
      ? this.getCooperationByIdForStudent(id)
      : this.getCooperationByIdForTutor(id))

    return cooperationById
  },

  getCooperationByIdForTutor: async (id) => {
    const cooperationById = await Cooperation.findById(id).populate([
      { path: 'sections.resources.resource', select: '-createdAt -updatedAt' },
      {
        path: 'offer',
        populate: [
          {
            path: 'category',
            select: ['name', 'appearance']
          },
          {
            path: 'subject',
            select: 'name'
          },
          {
            path: 'author',
            select: ['firstName', 'lastName', 'photo', 'professionalSummary', 'totalReviews', 'FAQ', 'averageRating']
          }
        ],
        select: ['id', 'author', 'category', 'subject', 'title', 'languages', 'proficiencyLevel', 'description']
      },
      {
        path: 'initiator'
      },
      {
        path: 'receiver'
      }
    ])

    return cooperationById
  },

  getCooperationByIdForStudent: async (id) => {
    const [cooperationById] = await Cooperation.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(id)
        }
      },
      {
        $set: {
          sections: {
            $map: {
              input: '$sections',
              as: 'section',
              in: {
                _id: '$$section._id',
                title: '$$section.title',
                description: '$$section.description',
                resources: {
                  $filter: {
                    input: '$$section.resources',
                    as: 'resource',
                    cond: {
                      $eq: ['$$resource.availability.status', 'open']
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $unwind: {
          path: '$sections',
          includeArrayIndex: 'sections.sectionOrder',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$sections.resources',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'attachments',
          localField: 'sections.resources.resource',
          foreignField: '_id',
          as: 'attachment'
        }
      },
      {
        $lookup: {
          from: 'lessons',
          localField: 'sections.resources.resource',
          foreignField: '_id',
          as: 'lesson'
        }
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'sections.resources.resource',
          foreignField: '_id',
          as: 'quiz'
        }
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'sections.resources.resource',
          foreignField: '_id',
          as: 'question'
        }
      },
      {
        $set: {
          'sections.resources.resource': {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: ['$sections.resources.resourceType', 'attachment']
                  },
                  then: {
                    $first: '$attachment'
                  }
                },
                {
                  case: {
                    $eq: ['$sections.resources.resourceType', 'lesson']
                  },
                  then: {
                    $first: '$lesson'
                  }
                },
                {
                  case: {
                    $eq: ['$sections.resources.resourceType', 'quiz']
                  },
                  then: {
                    $first: '$quiz'
                  }
                },
                {
                  case: {
                    $eq: ['$sections.resources.resourceType', 'question']
                  },
                  then: {
                    $first: '$question'
                  }
                }
              ],
              default: '$$REMOVE'
            }
          }
        }
      },
      {
        $group: {
          _id: '$sections._id',
          resources: {
            $push: '$sections.resources'
          },
          cooperationId: {
            $first: '$_id'
          },
          offer: {
            $first: '$offer'
          },
          initiator: {
            $first: '$initiator'
          },
          initiatorRole: {
            $first: '$initiatorRole'
          },
          receiver: {
            $first: '$receiver'
          },
          receiverRole: {
            $first: '$receiverRole'
          },
          title: {
            $first: '$title'
          },
          additionalInfo: {
            $first: '$additionalInfo'
          },
          proficiencyLevel: {
            $first: '$proficiencyLevel'
          },
          price: {
            $first: '$price'
          },
          status: {
            $first: '$status'
          },
          needAction: {
            $first: '$needAction'
          },
          availableQuizzes: {
            $first: '$availableQuizzes'
          },
          finishedQuizzes: {
            $first: '$finishedQuizzes'
          },
          sections: {
            $first: '$sections'
          },
          createdAt: {
            $first: '$createdAt'
          },
          updatedAt: {
            $first: '$updatedAt'
          },
          sectionOrder: {
            $first: '$sectionOrder'
          }
        }
      },
      {
        $sort: {
          'sections.sectionOrder': 1
        }
      },
      {
        $set: {
          _id: '$cooperationId',
          resources: '$$REMOVE',
          cooperationId: '$$REMOVE',
          'sections.sectionOrder': '$$REMOVE',
          'sections.resources': {
            $filter: {
              input: '$resources',
              as: 'resource',
              cond: { $ne: ['$$resource', {}] }
            }
          }
        }
      },
      {
        $set: {
          sections: {
            $cond: {
              if: {
                $eq: ['$sections', { resources: [] }]
              },
              then: '$$REMOVE',
              else: '$sections'
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          offer: {
            $first: '$offer'
          },
          initiator: {
            $first: '$initiator'
          },
          initiatorRole: {
            $first: '$initiatorRole'
          },
          receiver: {
            $first: '$receiver'
          },
          receiverRole: {
            $first: '$receiverRole'
          },
          title: {
            $first: '$title'
          },
          additionalInfo: {
            $first: '$additionalInfo'
          },
          proficiencyLevel: {
            $first: '$proficiencyLevel'
          },
          price: {
            $first: '$price'
          },
          status: {
            $first: '$status'
          },
          needAction: {
            $first: '$needAction'
          },
          availableQuizzes: {
            $first: '$availableQuizzes'
          },
          finishedQuizzes: {
            $first: '$finishedQuizzes'
          },
          sections: {
            $push: '$sections'
          },
          createdAt: {
            $first: '$createdAt'
          },
          updatedAt: {
            $first: '$updatedAt'
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'initiator',
          foreignField: '_id',
          as: 'initiator'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'receiver',
          foreignField: '_id',
          as: 'receiver'
        }
      },
      {
        $lookup: {
          from: 'offers',
          localField: 'offer',
          foreignField: '_id',
          as: 'offer',
          pipeline: [
            {
              $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author'
              }
            },
            {
              $lookup: {
                from: 'subjects',
                localField: 'subject',
                foreignField: '_id',
                as: 'subject'
              }
            },
            {
              $set: {
                author: {
                  $first: ['$author']
                },
                category: {
                  $first: ['$category']
                },
                subject: {
                  $first: ['$subject']
                }
              }
            },
            {
              $project: {
                _id: true,
                author: {
                  _id: true,
                  firstName: true,
                  lastName: true,
                  photo: true,
                  professionalSummary: true,
                  totalReviews: true,
                  FAQ: true,
                  averageRating: true
                },
                category: {
                  _id: true,
                  name: true,
                  appearance: true
                },
                subject: {
                  _id: true,
                  name: true
                },
                title: true,
                languages: true,
                proficiencyLevel: true,
                description: true
              }
            }
          ]
        }
      },
      {
        $set: {
          initiator: {
            $first: ['$initiator']
          },
          receiver: {
            $first: ['$receiver']
          },
          offer: {
            $first: ['$offer']
          }
        }
      },
      {
        $project: {
          initiator: {
            appLanguage: false,
            bookmarkedOffers: false,
            isEmailConfirmed: false,
            isFirstLogin: false,
            lastLoginAs: false,
            password: false
          },
          receiver: {
            appLanguage: false,
            bookmarkedOffers: false,
            isEmailConfirmed: false,
            isFirstLogin: false,
            lastLoginAs: false,
            password: false
          },
          'sections.resources.resource': {
            createdAt: false,
            updatedAt: false
          }
        }
      }
    ])

    return cooperationById
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

    const cooperation = await Cooperation.findById(id)
    cooperationService._validateCooperationUser(cooperation, currentUserId)

    if (price) {
      if (currentUserRole !== cooperation.needAction.toString()) {
        throw createForbiddenError()
      }
      const updatedNeedAction = cooperation.needAction.toString() === 'student' ? 'tutor' : 'student'

      await Cooperation.findByIdAndUpdate(id, { price, needAction: updatedNeedAction }).exec()
    }
    if (status) {
      const isRequestToClose = status === COOPERATION_STATUS_ENUM[4]
      const otherRole = currentUserRole === roles.STUDENT ? roles.TUTOR : roles.STUDENT
      const updatedNeedAction = isRequestToClose ? otherRole : undefined

      await Cooperation.findByIdAndUpdate(id, { status, needAction: updatedNeedAction }, { runValidators: true })
    }
    if (sections) {
      cooperation.sections = await Promise.all(
        sections.map(async (section) => ({
          ...section,
          resources: await handleResources(section.resources)
        }))
      )

      cooperation.markModified('sections')

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
  },

  updateResourceCompletionStatus: async ({ id, currentUser, resourceId, completionStatus }) => {
    const { id: currentUserId, role: currentUserRole } = currentUser

    if (currentUserRole !== roles.STUDENT) {
      throw createError(403, ROLE_REQUIRED_FOR_ACTION(roles.STUDENT))
    }

    const cooperation = await Cooperation.findById(id)
    cooperationService._validateCooperationUser(cooperation, currentUserId)

    let resourceIdExists = false

    for (const section of cooperation.sections) {
      for (const resource of section.resources) {
        if (resource.resource.toString() === resourceId) {
          resource.completionStatus = completionStatus
          resourceIdExists = true
          break
        }
      }
    }

    if (!resourceIdExists) {
      throw createError(404, DOCUMENT_NOT_FOUND([`Resource in ${Cooperation.modelName}`]))
    }

    cooperation.markModified('sections')

    await cooperation.validate()
    await cooperation.save()
  },

  getProficiencyLevel: async (offerId, requesterId, partnerId) => {
    const proficiencyLevel = await Cooperation.findOne({
      offer: offerId,
      $or: [
        {
          receiver: requesterId,
          initiator: partnerId
        },
        {
          receiver: partnerId,
          initiator: requesterId
        }
      ]
    })
      .select('proficiencyLevel')
      .lean()
      .exec()

    return proficiencyLevel?.proficiencyLevel ?? null
  }
}

module.exports = cooperationService

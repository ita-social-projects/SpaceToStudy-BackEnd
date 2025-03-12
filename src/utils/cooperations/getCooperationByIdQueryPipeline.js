const mongoose = require('mongoose')
const { DEFAULT_AGGREGATION_UNSELECTABLE_USER_FIELDS } = require('~/consts/user')

const getCooperationByIdQueryPipeline = (id, isClosedResourcesHidden) => {
  const filterOnlyOpenResources = {
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

  const commonGroupFields = {
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
    }
  }

  return [
    {
      $match: {
        _id: mongoose.Types.ObjectId(id)
      }
    },
    {
      $set: isClosedResourcesHidden ? filterOnlyOpenResources : {}
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
        ...commonGroupFields,
        _id: '$sections._id',
        resources: {
          $push: '$sections.resources'
        },
        cooperationId: {
          $first: '$_id'
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
        },
        completedResourcesCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$sections.resources.completionStatus', 'completed'] },
                  { $eq: ['$sections.resources.availability.status', 'open'] }
                ]
              },
              1,
              0
            ]
          }
        },
        totalResourcesCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ifNull: ['$sections.resources', false] },
                  { $eq: ['$sections.resources.availability.status', 'open'] }
                ]
              },
              1,
              0
            ]
          }
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
      $set: {
        completedResourcesPercentage: {
          $cond: {
            if: { $gt: ['$totalResourcesCount', 0] },
            then: { $floor: { $multiply: [{ $divide: ['$completedResourcesCount', '$totalResourcesCount'] }, 100] } },
            else: 0
          }
        }
      }
    },
    {
      $group: {
        ...commonGroupFields,
        _id: '$_id',
        sections: {
          $push: '$sections'
        },
        createdAt: {
          $first: '$createdAt'
        },
        updatedAt: {
          $first: '$updatedAt'
        },
        completedResourcesPercentage: {
          $first: '$completedResourcesPercentage'
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
                $first: '$author'
              },
              category: {
                $first: '$category'
              },
              subject: {
                $first: '$subject'
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
          $first: '$initiator'
        },
        receiver: {
          $first: '$receiver'
        },
        offer: {
          $first: '$offer'
        }
      }
    },
    {
      $project: {
        initiator: DEFAULT_AGGREGATION_UNSELECTABLE_USER_FIELDS,
        receiver: DEFAULT_AGGREGATION_UNSELECTABLE_USER_FIELDS,
        'sections.resources.resource': {
          createdAt: false,
          updatedAt: false
        }
      }
    }
  ]
}

module.exports = getCooperationByIdQueryPipeline

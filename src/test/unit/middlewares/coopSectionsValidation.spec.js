const { createError } = require('~/utils/errorsHelper')
const coopSectionsValidation = require('~/middlewares/coopSectionsValidation')

const { FIELD_IS_NOT_OF_PROPER_TYPE } = require('~/consts/errors')
const {
  enums: { RESOURCES_TYPES_ENUM }
} = require('~/consts/validation')

jest.mock('~/utils/cooperations/sections/validateAttachment')
jest.mock('~/utils/cooperations/sections/validateLesson')
jest.mock('~/utils/cooperations/sections/validateQuiz')

const lessonMock = {
  resource: {
    title: 'Title',
    availability: { status: 'open', date: null },
    content: 'Content'
  },
  resourceType: RESOURCES_TYPES_ENUM[0]
}

const quizMock = {
  resource: {
    title: 'Title',
    text: 'Text',
    availability: { status: 'open', date: null },
    answers: [{ text: 'Answer 1', isCorrect: true }]
  },
  resourceType: RESOURCES_TYPES_ENUM[1]
}

const attachmentMock = {
  resource: {
    title: 'Title.png',
    link: '5534-Title.png',
    availability: { status: 'open', date: null }
  },
  resourceType: RESOURCES_TYPES_ENUM[2]
}

const next = jest.fn()

const req = {
  body: {
    sections: [
      {
        resources: [
          { resource: lessonMock.resource, resourceType: lessonMock.resourceType },
          { resource: attachmentMock.resource, resourceType: attachmentMock.resourceType },
          { resource: quizMock.resource, resourceType: quizMock.resourceType }
        ]
      }
    ]
  }
}

describe('coopSectionsValidation', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should validate each resource and call next', () => {
    const middlewareFunc = () => coopSectionsValidation(req, {}, next)

    middlewareFunc()

    expect(next).toHaveBeenCalledTimes(1)

    expect(middlewareFunc).not.toThrow()
  })

  it('should throw error if resource is not an object', () => {
    const errReq = {
      body: {
        sections: [
          {
            resources: [
              { resource: 'string', resourceType: 'lesson' },
              { resource: 'string', resourceType: 'quiz' },
              { resource: 'string', resourceType: 'attachment' }
            ]
          }
        ]
      }
    }

    const middlewareFunc = () => coopSectionsValidation(errReq, {}, next)

    expect(middlewareFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('resource', 'object')))
  })

  it('should call validateLesson for LESSON resourceType', () => {
    coopSectionsValidation(req, {}, next)

    expect(require('~/utils/cooperations/sections/validateLesson')).toHaveBeenCalledTimes(1)
  })

  it('should call validateQuiz for QUIZ resourceType', () => {
    coopSectionsValidation(req, {}, next)

    expect(require('~/utils/cooperations/sections/validateQuiz')).toHaveBeenCalledTimes(1)
  })

  it('should call validateAttachment for ATTACHMENT resourceType', () => {
    coopSectionsValidation(req, {}, next)

    expect(require('~/utils/cooperations/sections/validateAttachment')).toHaveBeenCalledTimes(1)
  })
})

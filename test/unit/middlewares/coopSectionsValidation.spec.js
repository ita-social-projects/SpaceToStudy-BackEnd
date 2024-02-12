const { createError } = require('~/utils/errorsHelper')
const coopSectionsValidation = require('~/middlewares/coopSectionsValidation')

const { QUIZ, LESSON, ATTACHMENT } = require('~/consts/models')
const { FIELD_IS_NOT_OF_PROPER_TYPE } = require('~/consts/errors')

jest.mock('~/utils/cooperations/sections/validateAttachment')
jest.mock('~/utils/cooperations/sections/validateLesson')
jest.mock('~/utils/cooperations/sections/validateQuiz')

const quizMock = {
  title: 'Title',
  text: 'Text',
  availability: { status: 'open', date: null },
  answers: [{ text: 'Answer 1', isCorrect: true }]
}

const attachmentMock = { title: 'Title.png', link: '5534-Title.png', availability: { status: 'open', date: null } }

const lessonMock = { title: 'Title', availability: { status: 'open', date: null }, content: 'Content' }

const next = jest.fn()

const req = {
  body: {
    sections: [
      {
        activities: [
          { resource: lessonMock, resourceType: LESSON },
          { resource: quizMock, resourceType: QUIZ },
          { resource: attachmentMock, resourceType: ATTACHMENT }
        ]
      }
    ]
  }
}

describe('coopSectionsValidation', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should validate each activity resource and call next', () => {
    const middlewareFunc = () => coopSectionsValidation(req, {}, next)

    middlewareFunc()

    expect(next).toHaveBeenCalledTimes(1)

    expect(middlewareFunc).not.toThrow()
  })

  it('should throw error if activity resource is not an object', () => {
    const errReq = { body: { sections: [{ activities: [{ resource: 'string', resourceType: QUIZ }] }] } }

    const middlewareFunc = () => coopSectionsValidation(errReq, {}, next)

    expect(middlewareFunc).toThrow(createError(400, FIELD_IS_NOT_OF_PROPER_TYPE('activity resource', 'object')))
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

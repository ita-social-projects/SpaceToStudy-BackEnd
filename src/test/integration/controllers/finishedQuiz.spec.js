const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')

const Quiz = require('~/models/quiz')
const Offer = require('~/models/offer')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const Cooperation = require('~/models/cooperation')
const Lesson = require('~/models/lesson')

const testUserAuthentication = require('~/utils/testUserAuth')
const { UNAUTHORIZED, DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const {
  roles: { TUTOR }
} = require('~/consts/auth')
const {
  enums: { RESOURCES_TYPES_ENUM, RESOURCE_COMPLETION_STATUS_ENUM }
} = require('~/consts/validation')
const TokenService = require('~/services/token')

const endpointUrl = '/finished-quizzes/'
const nonExistingQuiz = '64cf8a3d40135fba5a0c8fa2'

const testFinishedQuizData = {
  grade: 100,
  results: [
    {
      question: 'Is it the best programming language?',
      answers: [
        {
          text: 'Yes',
          isCorrect: true,
          isChosen: false
        },
        {
          text: 'Yes, of course',
          isCorrect: false,
          isChosen: true
        }
      ]
    }
  ]
}

const tutorUserData = {
  role: ['tutor'],
  firstName: 'albus',
  lastName: 'dumbledore',
  email: 'lovemagic@gmail.com',
  password: 'supermagicpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLoginAs: 'tutor'
}

const testQuizData = {
  title: 'Assembly',
  description: 'Description',
  category: '6502ec2060ec37be943353e2',
  items: ['6527ed6c14c6b72f36962364']
}

const testOfferData = {
  authorRole: 'tutor',
  price: 99,
  proficiencyLevel: 'Beginner',
  title: 'First-class teacher. Director of the Hogwarts school of magic',
  description: 'I will teach you how to protect yourself and your family from dark arts',
  languages: 'English',
  FAQ: [{ question: 'Do you enjoy being a director of the Hogwarts?', answer: 'Actually yes, i really like it.' }]
}

const testCooperationData = {
  price: 99,
  receiverRole: 'tutor',
  proficiencyLevel: 'Beginner',
  title: 'First-class teacher. Director of the Hogwarts school of magic',
  sections: [
    {
      title: 'Solving Quadratic Equations Using the Quadratic Formula',
      description: 'Solving Quadratic Equations Using the Quadratic Formula',
      resources: [
        {
          resource: '6684179479e5232bce4579fa',
          author: '6658f73f93885febb491e08b',
          content: '<p><strong>Solving Quadratic Equations Using the Quadratic Formula</strong></p>',
          description: 'The quadratic formula',
          title: 'Solving Quadratic Equations Using the Quadratic Formula',
          category: '6684175179e5232bce4579ed',
          resourceType: RESOURCES_TYPES_ENUM[0],
          availability: { status: 'open', date: null },
          completionStatus: RESOURCE_COMPLETION_STATUS_ENUM[0]
        },
        {
          resource: {
            _id: '6684179479e5232bce4579fa',
            author: '6658f73f93885febb491e08b',
            content: '<p><strong>Solving Quadratic Equations Using the Quadratic Formula</strong></p>',
            description: 'The quadratic formula',
            title: 'Solving Quadratic Equations Using the Quadratic Formula',
            category: '6684175179e5232bce4579ed',
            resourceType: RESOURCES_TYPES_ENUM[0]
          },
          resourceType: RESOURCES_TYPES_ENUM[0],
          availability: { status: 'closed', date: null },
          completionStatus: RESOURCE_COMPLETION_STATUS_ENUM[0]
        },
        {
          resource: {
            _id: '6684179479e5232bce4579fa',
            author: '6658f73f93885febb491e08b',
            content: '<p><strong>Solving Quadratic Equations Using the Quadratic Formula</strong></p>',
            description: 'The quadratic formula',
            title: 'Solving Quadratic Equations Using the Quadratic Formula',
            category: '6684175179e5232bce4579ed',
            resourceType: RESOURCES_TYPES_ENUM[0]
          },
          resourceType: RESOURCES_TYPES_ENUM[0],
          availability: { status: 'openFrom', date: '2024-12-13T22:00:00.000Z' },
          completionStatus: RESOURCE_COMPLETION_STATUS_ENUM[0]
        }
      ]
    }
  ]
}

describe('Quiz controller', () => {
  let app,
    server,
    accessToken,
    currentUser,
    testFinishedQuiz,
    testQuiz,
    studentAccessToken,
    tutorAccessToken,
    testOffer,
    anotherStudentAccessToken,
    testCooperation,
    testStudentUser,
    testTutorUser

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })
    testStudentUser = TokenService.validateAccessToken(studentAccessToken)
    tutorAccessToken = await testUserAuthentication(app, tutorUserData)
    testTutorUser = TokenService.validateAccessToken(tutorAccessToken)
    currentUser = TokenService.validateAccessToken(accessToken)

    const category = await Category.create({
      name: 'Dark Magic',
      appearance: {
        icon: 'path-to-icon',
        color: '#66C42C'
      }
    })

    const subject = await Subject.create({
      name: 'Defense Against the Dark Arts',
      category: category._id
    })

    testQuiz = await Quiz.create({
      author: currentUser.id,
      ...testQuizData
    })

    testOffer = await Offer.create({
      author: testTutorUser.id,
      subject: subject._id,
      category: category._id,
      ...testOfferData
    })

    const testLessonOpenResource = await Lesson.create({
      author: testTutorUser.id,
      content: '<p><strong>Solving Quadratic Equations Using the Quadratic Formula</strong></p>',
      description: 'The quadratic formula',
      title: 'Solving Quadratic Equations Using the Quadratic Formula',
      category: category._id,
      resourceType: RESOURCES_TYPES_ENUM[0]
    })

    const testLessonClosedResource = await Lesson.create({
      author: testTutorUser.id,
      content: '<p><strong>Solving Quadratic Equations Using the Quadratic Formula</strong></p>',
      description: 'The quadratic formula',
      title: 'Solving Quadratic Equations Using the Quadratic Formula',
      category: category._id,
      resourceType: RESOURCES_TYPES_ENUM[0]
    })

    const testLessonOpenFromResource = await Lesson.create({
      author: testTutorUser.id,
      content: '<p><strong>Solving Quadratic Equations Using the Quadratic Formula</strong></p>',
      description: 'The quadratic formula',
      title: 'Solving Quadratic Equations Using the Quadratic Formula',
      category: category._id,
      resourceType: RESOURCES_TYPES_ENUM[0]
    })

    const updatedTestCooperationData = {
      ...testCooperationData,
      sections: [
        {
          ...testCooperationData.sections[0],
          resources: [
            {
              resource: testLessonOpenResource._id,
              resourceType: RESOURCES_TYPES_ENUM[0],
              availability: { status: 'open', date: null }
            },
            {
              resource: testLessonClosedResource._id,
              resourceType: RESOURCES_TYPES_ENUM[0],
              availability: { status: 'closed', date: null }
            },
            {
              resource: testLessonOpenFromResource._id,
              resourceType: RESOURCES_TYPES_ENUM[0],
              availability: { status: 'openFrom', date: '2024-12-13T22:00:00.000Z' }
            }
          ]
        }
      ]
    }

    testCooperation = await app
      .post(endpointUrl)
      .set('Cookie', [`accessToken=${studentAccessToken}`])
      .send({
        receiver: testTutorUser.id,
        receiverRole: tutorUserData.role[0],
        offer: testOffer._id,
        sections: updatedTestCooperationData.sections,
        ...updatedTestCooperationData
      })

    testFinishedQuiz = await app
      .post(endpointUrl)
      .send({ quiz: testQuiz._id, cooperation: testCooperation._body._id, ...testFinishedQuizData })
      .set('Cookie', [`accessToken=${accessToken}`])

    console.log('testFinishedQuiz1234', testFinishedQuiz)
    console.log('testCooperationId1234', testCooperation._body._id)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should create a new finished quiz', async () => {
      expect(testFinishedQuiz.statusCode).toBe(201)
      expect(testFinishedQuiz._body).toMatchObject({
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        quiz: testQuiz._id,
        cooperation: testCooperation._body._id,
        ...testFinishedQuizData
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw DOCUMENT_NOT_FOUND for quiz', async () => {
      const response = await app
        .post(endpointUrl)
        .send({
          ...testFinishedQuizData,
          quiz: nonExistingQuiz
        })
        .set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Quiz.modelName]), response)
    })
  }),
  describe(`GET ${endpointUrl}`, () => {
    it('should get all finished quizzes', async () => {
      const response = await app.get(`${endpointUrl}`).set('Cookie', [`accessToken=${accessToken}`])
      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body.items)).toBeTruthy()
      expect(response.body).toEqual({
        items: [
          {
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            quiz: String(testQuiz._id),
            cooperation: String(testCooperation._body._id),
            ...testFinishedQuizData,
            count: 0,
            items: []
          }
        ],
        count: 1
      })
    })
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)
      expectError(401, UNAUTHORIZED, response)
    })
  })
})

const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')

const Quiz = require('~/models/quiz')
const Cooperation = require('~/models/cooperation')

const testUserAuthentication = require('~/utils/testUserAuth')
const { UNAUTHORIZED } = require('~/consts/errors')
const {
  roles: { TUTOR }
} = require('~/consts/auth')
const TokenService = require('~/services/token')

const endpointUrl = '/finished-quizzes/'

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

const testInitiator = {
  _id: '66b346570182fc9e49b09647',
  averageRating: {
    student: 0,
    tutor: 0
  },
  createdAt: '2024-08-07T10:03:03.488Z',
  email: 'potter@gmail.com',
  firstName: 'harry',
  lastLogin: '2024-08-07T10:03:03.587Z',
  lastName: 'potter',
  mainSubjects: {
    student: [],
    tutor: []
  },
  nativeLanguage: null,
  professionalBlock: {
    awards: '',
    education: '',
    scientificActivities: '',
    workExperience: ''
  },
  role: ['tutor'],
  status: {
    admin: 'active',
    student: 'active',
    tutor: 'active'
  },
  totalReviews: {
    student: 0,
    tutor: 0
  },
  updatedAt: '2024-08-07T10:03:03.587Z'
}

const cooperationMockData = {
  title: 'Violin lessons',
  proficiencyLevel: 'Test Preparation',
  offer: '63ebc6fbd2f34037d0aba791',
  receiver: '6255bc080a75adf9223df100',
  receiverRole: 'student',
  price: 300,
  needAction: 'student',
  initiator: testInitiator
}

const testQuizData = {
  title: 'Assembly',
  description: 'Description',
  category: '6502ec2060ec37be943353e2',
  items: ['6527ed6c14c6b72f36962364']
}

describe('Quiz controller', () => {
  // let app, server, accessToken, currentUser, testFinishedQuiz, testQuiz, testCooperation
  let app, server, accessToken, currentUser, testQuiz, testCooperation

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })

    currentUser = TokenService.validateAccessToken(accessToken)

    testQuiz = await Quiz.create({
      author: currentUser.id,
      ...testQuizData
    })

    testCooperation = await Cooperation.create({
      ...cooperationMockData
    })

    // testFinishedQuiz = await app
    //   .post(endpointUrl)
    //   .send({ quiz: testQuiz._id, cooperation: testCooperation._id, ...testFinishedQuizData })
    //   .set('Cookie', [`accessToken=${accessToken}`])
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  // describe(`POST ${endpointUrl}`, () => {
  //   it('should create a new finished quiz', async () => {
  //     expect(testFinishedQuiz.statusCode).toBe(201)
  //     expect(testFinishedQuiz._body).toMatchObject({
  //       _id: expect.any(String),
  //       createdAt: expect.any(String),
  //       updatedAt: expect.any(String),
  //       quiz: testQuiz._id,
  //       cooperation: testCooperation._id,
  //       ...testFinishedQuizData
  //     })
  //   })

  //   it('should throw UNAUTHORIZED', async () => {
  //     const response = await app.post(endpointUrl)

  //     expectError(401, UNAUTHORIZED, response)
  //   })

  //   it('should throw DOCUMENT_NOT_FOUND for quiz', async () => {
  //     const response = await app
  //       .post(endpointUrl)
  //       .send({
  //         ...testFinishedQuizData,
  //         quiz: nonExistingQuiz
  //       })
  //       .set('Cookie', [`accessToken=${accessToken}`])

  //     expectError(404, DOCUMENT_NOT_FOUND([Quiz.modelName]), response)
  //   })
  // }),

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
            cooperation: String(testCooperation._id),
            ...testFinishedQuizData
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

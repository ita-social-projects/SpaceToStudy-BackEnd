const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { DOCUMENT_NOT_FOUND, UNAUTHORIZED, VALIDATION_ERROR, FORBIDDEN } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')

const Offer = require('~/models/offer')
const User = require('~/models/user')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const Cooperation = require('~/models/cooperation')
const Quiz = require('~/models/quiz')

const endpointUrl = '/cooperations/'
const nonExistingCooperationId = '19cf23e07281224fbbee3241'
const nonExistingOfferId = '648ae644aa322613ba08e69e'
const validationErrorMessage = 'You can change only either the status or the price in one operation'

const tutorUserData = {
  role: ['tutor'],
  firstName: 'albus',
  lastName: 'dumbledore',
  email: 'lovemagic@gmail.com',
  password: 'supermagicpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON()
}

const studentUserData = {
  role: ['student'],
  firstName: 'harry',
  lastName: 'potter',
  email: 'potter@gmail.com',
  password: 'supermagicpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON()
}

const anotherUserData = {
  role: ['tutor'],
  firstName: 'james',
  lastName: 'potter',
  email: 'jamespotter@gmail.com',
  password: 'supersecretpass888',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON()
}

const testCooperationData = {
  price: 99,
  receiverRole: 'tutor',
  proficiencyLevel: 'Beginner',
  title: 'First-class teacher. Director of the Hogwarts school of magic',
  additionalInfo:
    'I don`t like both Dark Arts and Voldemort that`s why i want to learn your subject and became your student'
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

const testActiveQuizData = {
  title: 'My test quiz',
  items: []
}

const updateStatus = {
  status: 'active'
}

const updatePrice = {
  price: 150
}

const updatingSections = [
  {
    _id: '65bc2bec67c9f1ec287a1514',
    title: 'Updated Section',
    description: 'This is the updated section description',
    resources: []
  }
]

const updatedSections = [
  {
    _id: '65bc2bec67c9f1ec287a1514',
    title: 'Updated Section',
    description: 'This is the updated section description',
    resources: []
  }
]

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
  role: ['student'],
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

describe('Cooperation controller', () => {
  let app,
    server,
    accessToken,
    testOffer,
    anotherUserAccessToken,
    testCooperation,
    testStudentUser,
    testTutorUser,
    testActiveQuiz

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, studentUserData)

    anotherUserAccessToken = await testUserAuthentication(app, anotherUserData)

    testStudentUser = TokenService.validateAccessToken(accessToken)

    testTutorUser = await User.create(tutorUserData)

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

    testOffer = await Offer.create({
      author: testTutorUser._id,
      subject: subject._id,
      category: category._id,
      ...testOfferData
    })

    testActiveQuiz = await Quiz.create({
      author: testTutorUser._id,
      category: category._id,
      ...testActiveQuizData
    })

    testCooperation = await app
      .post(endpointUrl)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({
        receiver: testTutorUser._id,
        receiverRole: tutorUserData.role[0],
        offer: testOffer._id,
        ...testCooperationData
      })
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`GET ${endpointUrl}`, () => {
    it('get all cooperation', async () => {
      const query = {
        skip: 0,
        limit: 5,
        sort: JSON.stringify({ order: 'asc', orderBy: 'updatedAt' })
      }

      const response = await app
        .get(endpointUrl)
        .query(query)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.status).toBe(200)
      expect(response.body.count).toBe(1)
      expect(Array.isArray(response.body.items)).toBe(true)
      expect(response.body.items[0]).toMatchObject({
        _id: testCooperation._body._id.toString(),
        offer: {
          _id: testOffer._id.toString()
        },
        initiator: testStudentUser.id.toString(),
        receiver: testTutorUser._id.toString(),
        additionalInfo: testCooperationData.additionalInfo,
        proficiencyLevel: testCooperationData.proficiencyLevel,
        price: testCooperationData.price,
        title: testCooperationData.title,
        status: 'pending',
        needAction: tutorUserData.role[0],
        createdAt: testCooperation._body.createdAt,
        updatedAt: testCooperation._body.updatedAt
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe(`GET ${endpointUrl}:id`, () => {
    it('get cooperation by ID', async () => {
      const response = await app
        .get(endpointUrl + testCooperation.body._id)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        _id: testCooperation._body._id.toString(),
        offer: {
          _id: testOffer._id.toString(),
          author: { _id: testOffer.author.toString() }
        },
        initiator: {
          ...testInitiator,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          lastLogin: expect.any(String),
          _id: expect.any(String)
        },
        receiver: {
          _id: expect.any(String),
          averageRating: {
            student: 0,
            tutor: 0
          },
          createdAt: expect.any(String),
          email: 'lovemagic@gmail.com',
          firstName: 'albus',
          lastLogin: expect.any(String),
          lastName: 'dumbledore',
          mainSubjects: {
            student: [],
            tutor: []
          },
          nativeLanguage: null,
          notificationSettings: {
            isChatNotification: true,
            isEmailNotification: true,
            isOfferStatusNotification: true,
            isSimilarOffersNotification: true
          },
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
          updatedAt: expect.any(String)
        },
        receiverRole: tutorUserData.role[0],
        additionalInfo: testCooperationData.additionalInfo,
        proficiencyLevel: testCooperationData.proficiencyLevel,
        price: testCooperationData.price,
        title: testCooperationData.title,
        status: 'pending',
        needAction: tutorUserData.role[0],
        createdAt: testCooperation._body.createdAt,
        updatedAt: testCooperation._body.updatedAt
      })
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .get(endpointUrl + nonExistingCooperationId)
        .set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Cooperation.modelName]), response)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl + testCooperation.body._id)

      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should create new cooperation', () => {
      expect(testCooperation.status).toBe(201)
      expect(testCooperation.body).toMatchObject({
        _id: testCooperation._body._id.toString(),
        offer: testOffer._id.toString(),
        initiator: testStudentUser.id,
        receiver: testTutorUser._id.toString(),
        receiverRole: tutorUserData.role[0],
        additionalInfo: testCooperationData.additionalInfo,
        proficiencyLevel: testCooperationData.proficiencyLevel,
        price: testCooperationData.price,
        title: testCooperationData.title,
        status: 'pending',
        needAction: tutorUserData.role[0],
        createdAt: testCooperation._body.createdAt,
        updatedAt: testCooperation._body.updatedAt
      })
    })

    it('should throw DOCUMENT_NOT_FOUND for offer entity', async () => {
      const response = await app
        .post(endpointUrl)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({
          initiator: testStudentUser.id,
          receiver: testTutorUser._id,
          offer: nonExistingOfferId,
          ...testCooperationData
        })

      expectError(404, DOCUMENT_NOT_FOUND([Offer.modelName]), response)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe(`PATCH ${endpointUrl}:id`, () => {
    it('should throw FORBIDDEN if user role does not match needAction role when updating price', async () => {
      const response = await app
        .patch(endpointUrl + testCooperation._body._id)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(updatePrice)

      expectError(403, FORBIDDEN, response)
    })

    it('should update the status of a cooperation', async () => {
      const updateResponse = await app
        .patch(endpointUrl + testCooperation._body._id)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(updateStatus)

      const response = await app
        .get(endpointUrl + testCooperation._body._id)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(updateResponse.status).toBe(204)
      expect(response.body.status).toBe(updateStatus.status)
    })

    it('should update the sections of a cooperation', async () => {
      const updateResponse = await app
        .patch(endpointUrl + testCooperation._body._id)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({ sections: updatingSections })

      const response = await app
        .get(endpointUrl + testCooperation._body._id)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(updateResponse.status).toBe(204)
      expect(response.body.sections).toEqual(updatedSections)
    })

    it('should update the available quizzes of a cooperation', async () => {
      const updateResponse = await app
        .patch(endpointUrl + testCooperation._body._id)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({ availableQuizzes: [testActiveQuiz._id] })

      const response = await app
        .get(endpointUrl + testCooperation._body._id)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(updateResponse.status).toBe(204)
      expect(response.body.availableQuizzes).toEqual([testActiveQuiz._id.toString()])
    })

    it('should update the finished quizzes of a cooperation', async () => {
      const updateResponse = await app
        .patch(endpointUrl + testCooperation._body._id)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({ finishedQuizzes: [testActiveQuiz._id] })

      const response = await app
        .get(endpointUrl + testCooperation._body._id)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(updateResponse.status).toBe(204)
      expect(response.body.finishedQuizzes).toEqual([testActiveQuiz._id.toString()])
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = (testCooperation = await app
        .patch(endpointUrl + nonExistingCooperationId)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(updateStatus))

      expectError(404, DOCUMENT_NOT_FOUND([Cooperation.modelName]), response)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw VALIDATION_ERROR', async () => {
      const response = await app
        .patch(endpointUrl + testCooperation._body._id)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({ ...updateStatus, ...updatePrice })

      expectError(409, VALIDATION_ERROR(validationErrorMessage), response)
    })

    it('should throw FORBIDDEN if user is not the initiator or receiver', async () => {
      const response = await app
        .patch(endpointUrl + testCooperation._body._id)
        .set('Cookie', [`accessToken=${anotherUserAccessToken}`])
        .send(updateStatus)

      expectError(403, FORBIDDEN, response)
    })
  })
})

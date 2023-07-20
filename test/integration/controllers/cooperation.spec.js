const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { DOCUMENT_NOT_FOUND, UNAUTHORIZED } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')

const Offer = require('~/models/offer')
const User = require('~/models/user')
const Category = require('~/models/category')
const Subject = require('~/models/subject')

const endpointUrl = '/cooperations/'
const nonExistingOfferId = '648ae644aa322613ba08e69e'

let tutorUserData = {
  role: ['tutor'],
  firstName: 'albus',
  lastName: 'dumbledore',
  email: 'lovemagic@gmail.com',
  password: 'supermagicpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON()
}

let studentUserData = {
  role: ['student'],
  firstName: 'harry',
  lastName: 'potter',
  email: 'potter@gmail.com',
  password: 'supermagicpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON()
}

const testCooperationData = {
  price: 99,
  receiverRole: 'tutor',
  proficiencyLevel: 'Beginner',
  additionalInfo:
    "I don't like both Dark Arts and Voldemort that's why i want to learn your subject and became your student"
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

const updateData = {
  status: 'active'
}

describe('Cooperation controller', () => {
  let app, server, accessToken, testOffer, testCooperation, testStudentUser, testTutorUser

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, studentUserData)

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

    testCooperation = await app
      .post(endpointUrl)
      .set('Authorization', `Bearer ${accessToken}`)
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

      const response = await app.get(endpointUrl).query(query).set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.count).toBe(1)
      expect(Array.isArray(response.body.items)).toBe(true)
      expect(response.body.items[0]).toMatchObject({
        _id: testCooperation._body._id,
        offer: {
          _id: testOffer._id
        },
        initiator: testStudentUser.id,
        receiver: testTutorUser._id,
        additionalInfo: testCooperationData.additionalInfo,
        proficiencyLevel: testCooperationData.proficiencyLevel,
        price: testCooperationData.price,
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
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        _id: testCooperation._body._id,
        offer: {
          _id: testOffer._id,
          price: testOfferData.price,
          author: testOffer.author
        },
        initiator: testStudentUser.id,
        receiver: testTutorUser._id,
        receiverRole: tutorUserData.role[0],
        additionalInfo: testCooperationData.additionalInfo,
        proficiencyLevel: testCooperationData.proficiencyLevel,
        price: testCooperationData.price,
        status: 'pending',
        needAction: tutorUserData.role[0],
        createdAt: testCooperation._body.createdAt,
        updatedAt: testCooperation._body.updatedAt
      })
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
        _id: testCooperation._body._id,
        offer: testOffer._id,
        initiator: testStudentUser.id,
        receiver: testTutorUser._id,
        receiverRole: tutorUserData.role[0],
        additionalInfo: testCooperationData.additionalInfo,
        proficiencyLevel: testCooperationData.proficiencyLevel,
        price: testCooperationData.price,
        status: 'pending',
        needAction: tutorUserData.role[0],
        createdAt: testCooperation._body.createdAt,
        updatedAt: testCooperation._body.updatedAt
      })
    })

    it('should throw DOCUMENT_NOT_FOUND for offer entity', async () => {
      const response = await app
        .post(endpointUrl)
        .set('Authorization', `Bearer ${accessToken}`)
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
    it('should update a cooperation', async () => {
      const updateResponse = await app
        .patch(endpointUrl + testCooperation._body._id)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)

      const response = await app
        .get(endpointUrl + testCooperation._body._id)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(updateResponse.status).toBe(204)
      expect(response.body.status).toBe(updateData.status)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })
  })
})

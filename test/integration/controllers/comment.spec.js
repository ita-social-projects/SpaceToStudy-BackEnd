const Category = require('~/models/category')
const Cooperation = require('~/models/cooperation')
const Offer = require('~/models/offer')
const Subject = require('~/models/subject')
const User = require('~/models/user')
const TokenService = require('~/services/token')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')

const endpointUrl = (id = ':id') => `cooperations/${id}/comments`


let testCommentData = {
  text:'my comment'
}

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
  proficiencyLevel: 'Beginner',
  additionalInfo:
        'I don\'t like both Dark Arts and Voldemort that\'s why i want to learn your subject and became your student'
}

describe('Comment controller', () => {
  let app, server, accessToken, testCooperation, testStudentUser, testTutorUser, testOffer, testComment

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

    testCooperation = await Cooperation.create({
      initiator: testStudentUser._id,
      receiver: testTutorUser._id,
      offer: testOffer._id,
      initiatorRole:testStudentUser.role,
      receiverRole:testTutorUser.role,
      needAction: testTutorUser.role,
      ...testCooperationData
    })

    console.log(testCooperation)

    testComment = await app
      .post(endpointUrl(testCooperation._id))
      .set('Authorization', `Bearer ${accessToken}`)
      .send(testCommentData)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`GET ${endpointUrl()}`, () => {
    it('should get all comments', async () => {
      const response = await app.get(endpointUrl(testCooperation._id)).set('Authorization', `Bearer ${accessToken}`)

      expect(true).toBe(true)
      expect(response.statusCode).toBe(200)
    })
  })

  describe(`POST ${endpointUrl()}`, () => {
    it('should create a comment', async () => {
      expect(testComment.statusCode).toBe(201)
    })
  })
})

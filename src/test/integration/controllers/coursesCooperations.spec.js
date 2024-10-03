const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const { createUser, getCategory } = require('~/test/test-utils')
const subjectService = require('~/services/subject')
const Cooperation = require('~/models/cooperation')
const {
  enums: { RESOURCES_TYPES_ENUM }
} = require('~/consts/validation')

const endpointUrl = '/courses-cooperations'

const testLesson = {
  title: 'title',
  description: 'description',
  category: '6502ec2060ec37be943353e2',
  content: '<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</p>',
  attachments: []
}

const subjectBody = { name: 'English' }

const testResource = {
  resource: 'resourceId',
  resourceType: RESOURCES_TYPES_ENUM[0]
}

const cooperationResource = {
  resource: 'resourceId',
  resourceType: RESOURCES_TYPES_ENUM[0],
  availability: { status: 'open', date: null }
}

const testCourse = {
  title: 'Assembly',
  description: 'You will learn some modern programming language for all your needs',
  author: 'authorId',
  category: 'categoryId',
  subject: 'subjectId',
  proficiencyLevel: ['Beginner', 'Intermediate'],
  sections: [
    {
      title: 'Section 1',
      description: 'Description',
      resources: []
    }
  ]
}

const testOffer = {
  price: 330,
  proficiencyLevel: ['Beginner'],
  title: 'Test Title',
  author: '',
  authorRole: 'tutor',
  FAQ: [{ question: 'question1', answer: 'answer1' }],
  description: 'description',
  languages: ['Ukrainian'],
  enrolledUsers: [],
  subject: '',
  category: {
    _id: '',
    appearance: { icon: 'mocked-path-to-icon', color: '#66C42C' }
  }
}

const testCooperation = {
  offer: 'offerId',
  initiatorRole: 'student',
  receiver: 'tutorId',
  receiverRole: 'tutor',
  title: 'Cooperation title',
  proficiencyLevel: 'Beginner',
  price: 500,
  status: 'active',
  availableQuizzes: [],
  finishedQuizzes: [],
  sections: [
    {
      title: 'Section 1',
      description: 'description',
      resources: []
    }
  ]
}

describe('User controller', () => {
  let app, server, accessToken, userId, testLessonResponse, testLessonId, category, categoryId, testSubject, offerId

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    ;({ accessToken, userId } = await createUser(app, { role: 'tutor' }))

    category = await getCategory()
    categoryId = category._id

    subjectBody.category = categoryId
    testSubject = await subjectService.addSubject(subjectBody)

    testLesson.category = categoryId
    testLessonResponse = await app
      .post('/lessons/')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(testLesson)
    testLessonId = testLessonResponse.body._id

    testOffer.category = categoryId
    testOffer.subject = testSubject._id
    const testOfferResponse = await app
      .post('/offers/')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(testOffer)
    offerId = testOfferResponse.body._id

    testResource.resource = testLessonId
    cooperationResource.resource = testLessonId

    testCourse.author = userId
    testCourse.category = categoryId
    testCourse.subject = testSubject._id

    testCooperation.receiver = userId
    testCooperation.offer = offerId
  })

  afterEach(async () => {
    await serverCleanup()
    testCourse.sections[0].resources = []
    testCooperation.sections[0].resources = []
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`GET ${endpointUrl}/resource/:resourceId`, () => {
    it('should get courses and cooperations', async () => {
      await app
        .post('/courses/')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(testCourse)

      testCourse.sections[0].resources.push(testResource)
      const courseWithLessonResponse = await app
        .post('/courses/')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(testCourse)

      await app
        .post('/cooperations/')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(testCooperation)

      testCooperation.sections[0].resources.push(cooperationResource)
      const cooperationWithLessonResponse = await app
        .post('/cooperations/')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(testCooperation)

      await Cooperation.updateMany({ receiver: userId }, { status: 'active' })

      const response = await app
        .get(`${endpointUrl}/resource/${testLessonId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send()

      expect(response.body.courses.length).toBe(1)
      expect(response.body.courses[0]._id).toBe(courseWithLessonResponse.body._id)
      expect(response.body.cooperations.length).toBe(1)
      expect(response.body.cooperations[0]._id).toBe(cooperationWithLessonResponse.body._id)
    })
  })
})

const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const User = require('~/models/user')
const Offer = require('~/models/offer')
const Category = require('~/models/category')
const { DOCUMENT_NOT_FOUND, FORBIDDEN, UNAUTHORIZED, INVALID_ID } = require('~/consts/errors')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')
const { expectError } = require('~/test/helpers')
const { USER } = require('~/consts/upload')
const {
  roles: { TUTOR }
} = require('~/consts/auth')
const {
  enums: { STATUS_ENUM }
} = require('~/consts/validation')

const testUserAuthentication = require('~/utils/testUserAuth')
const createAggregateOptions = require('~/utils/users/createAggregateOptions')
const TokenService = require('~/services/token')
const userService = require('~/services/user')
const uploadService = require('~/services/upload')
const { default: mongoose } = require('mongoose')

const endpointUrl = '/users/'
const logoutEndpoint = '/auth/logout'

let userStudent, userAdmin

let testUser = {
  role: ['student'],
  firstName: 'john',
  lastName: 'doe',
  email: 'johndoe@gmail.com',
  password: 'supersecretpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON(),
  status: {
    student: STATUS_ENUM[0]
  },
  photo: 'userPhoto.jpeg',
  professionalSummary: 'A professional',
  nativeLanguage: 'English'
}

let adminUser = {
  role: ['admin'],
  firstName: 'TestAdmin',
  lastName: 'AdminTest',
  email: 'testadmin@gmail.com',
  password: 'supersecretpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  isFirstLogin: false,
  lastLoginAs: 'admin'
}

const updateUserData = {
  firstName: 'Albus',
  lastName: 'Dumbledore'
}

const nonExistingUserId = '6329a8c501bd35b52a5ecf8c'

const createAggregateFields = {
  limit: '10',
  skip: '5',
  orderBy: 'name',
  order: 'asc',
  role: 'admin',
  from: '2024-11-12',
  to: '2024-12-12',
  status: ['active', 'inactive']
}

const testOffer = {
  price: 330,
  proficiencyLevel: ['Beginner'],
  title: 'Offer Title',
  author: '65afa47f3d67b51996a67b92',
  authorRole: 'tutor',
  FAQ: [{ question: 'question1', answer: 'answer1' }],
  description: 'Test offer description',
  languages: ['Ukrainian'],
  enrolledUsers: ['6512e1ca5fd987b6ce926c2e', '652ba66bf6770c3a2d5d8549'],
  subject: 'subject',
  category: {
    _id: '',
    appearance: { icon: 'mocked-path-to-icon', color: '#66C42C' }
  }
}

describe('User controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe('Allowed endpoints', () => {
    let accessToken

    beforeEach(async () => {
      accessToken = await testUserAuthentication(app)
    })

    afterEach(async () => {
      await app.post('/auth/logout')
    })

    describe(`GET ${endpointUrl}`, () => {
      beforeEach(async () => {
        await User.create(testUser)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.get(endpointUrl)

        expectError(401, UNAUTHORIZED, response)
      })

      it('should GET all users', async () => {
        const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])

        expect(response.statusCode).toBe(200)
        expect(Array.isArray(response.body.items)).toBeTruthy()
        expect(response.body.items[response.body.items.length - 1]).toMatchObject({
          totalReviews: expect.objectContaining({
            student: expect.any(Number),
            tutor: expect.any(Number)
          }),
          averageRating: expect.objectContaining({
            student: expect.any(Number),
            tutor: expect.any(Number)
          }),
          status: expect.objectContaining({
            student: expect.any(String),
            tutor: expect.any(String),
            admin: expect.any(String)
          }),
          _id: expect.any(String),
          role: expect.any(Array),
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: testUser.email,
          mainSubjects: expect.objectContaining({
            tutor: expect.any(Array),
            student: expect.any(Array)
          }),
          lastLogin: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      })

      it('should GET all users which match query', async () => {
        const query = {
          email: testUser.email
        }

        const response = await app
          .get(endpointUrl)
          .query(query)
          .set('Cookie', [`accessToken=${accessToken}`])

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.items)).toBeTruthy()
        expect(response.body.items.length).toBe(1)
        expect(response.body.items[0]).toMatchObject({
          totalReviews: expect.objectContaining({
            student: expect.any(Number),
            tutor: expect.any(Number)
          }),
          averageRating: expect.objectContaining({
            student: expect.any(Number),
            tutor: expect.any(Number)
          }),
          status: expect.objectContaining({
            student: expect.any(String),
            tutor: expect.any(String),
            admin: expect.any(String)
          }),
          _id: expect.any(String),
          role: expect.any(Array),
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: testUser.email,
          mainSubjects: expect.objectContaining({
            student: expect.any(Array),
            tutor: expect.any(Array)
          }),
          lastLogin: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
        expect(response.body.count).toBe(1)
      })
    })

    describe(`GET ${endpointUrl}:id`, () => {
      let user

      beforeEach(async () => {
        user = await User.create(testUser)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.get(endpointUrl + user._id)

        expectError(401, UNAUTHORIZED, response)
      })

      it('should GET user by ID', async () => {
        const response = await app.get(endpointUrl + user._id).set('Cookie', [`accessToken=${accessToken}`])

        expect(response.statusCode).toBe(200)
        expect(response.body).toMatchObject({
          totalReviews: expect.objectContaining({
            student: expect.any(Number),
            tutor: expect.any(Number)
          }),
          averageRating: expect.objectContaining({
            student: expect.any(Number),
            tutor: expect.any(Number)
          }),
          status: expect.objectContaining({
            student: expect.any(String),
            tutor: expect.any(String),
            admin: expect.any(String)
          }),
          _id: expect.any(String),
          role: expect.any(Array),
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: testUser.email,
          mainSubjects: expect.objectContaining({
            student: expect.any(Array),
            tutor: expect.any(Array)
          }),
          lastLogin: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      })

      it('should throw DOCUMENT_NOT_FOUND', async () => {
        const response = await app.get(endpointUrl + nonExistingUserId).set('Cookie', [`accessToken=${accessToken}`])
        expectError(404, DOCUMENT_NOT_FOUND([User.modelName]), response)
      })
    })

    describe(`UPDATE ${endpointUrl}:id`, () => {
      it('should UPDATE USER PROFILE by his ID', async () => {
        const { id: currentUserId } = TokenService.validateAccessToken(accessToken)

        const response = await app
          .patch(endpointUrl + currentUserId)
          .send(updateUserData)
          .set('Cookie', [`accessToken=${accessToken}`])

        expect(response.statusCode).toBe(204)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.patch(endpointUrl + nonExistingUserId).send(updateUserData)

        expectError(401, UNAUTHORIZED, response)
      })

      it('should throw FORBIDDEN', async () => {
        const user = await User.create(testUser)

        const response = await app
          .patch(endpointUrl + user._id)
          .send(updateUserData)
          .set('Cookie', [`accessToken=${accessToken}`])

        expectError(403, FORBIDDEN, response)
      })
    })

    describe('account deactivation and activation', () => {
      it("should deactivate user's account", async () => {
        const { id: currentUserId } = TokenService.validateAccessToken(accessToken)

        const response = await app
          .patch(`${endpointUrl}/deactivate/${currentUserId}`)
          .set('Cookie', [`accessToken=${accessToken}`])
          .send()

        expect(response.statusCode).toBe(204)
      })

      it("should activate user's account", async () => {
        const { id: currentUserId } = TokenService.validateAccessToken(accessToken)

        const response = await app
          .patch(`${endpointUrl}/activate/${currentUserId}`)
          .set('Cookie', [`accessToken=${accessToken}`])
          .send()

        expect(response.statusCode).toBe(204)
      })

      it('should return FORBIDDEN when one account tries to deactivate another account', async () => {
        const user = await User.create(testUser)

        const response = await app
          .patch(`${endpointUrl}/${user._id}/deactivate`)
          .set('Cookie', [`accessToken=${accessToken}`])
          .send()

        expectError(403, FORBIDDEN, response)
      })
    })

    describe(`POST ${endpointUrl}`, () => {
      it('should create a new user', async () => {
        const newUser = await userService.createUser(
          'student',
          'Vika',
          'Douglas',
          'vika123@gmail.com',
          'pass123word',
          'en'
        )
        expect(newUser).toMatchObject({
          email: 'vika123@gmail.com',
          firstName: 'Vika',
          lastName: 'Douglas'
        })
      })
    })

    describe(`PATCH ${endpointUrl}/:id/bookmarks/offers/:offerId`, () => {
      const nonExistingOfferId = '6672f61ea0c8993fcd04d7ef'

      let user

      beforeEach(async () => {
        user = await User.create(testUser)

        await checkCategoryExistence()

        const categoryResponse = await Category.find()

        const { _id, appearance } = categoryResponse[0]
        const category = { _id: _id.toString(), appearance }

        const subjectResponse = await app
          .post('/subjects/')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send({
            name: 'testSubject',
            category: category
          })
        const subject = subjectResponse.body._id

        testOffer.category = category
        testOffer.subject = subject
        testOffer.author = user._id
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app
          .patch(`${endpointUrl}/${nonExistingUserId}/bookmarks/offers/${nonExistingOfferId}`)
          .send()

        expectError(401, UNAUTHORIZED, response)
      })

      it('should throw 404 DOCUMENT_NOT_FOUND if a user is not found', async () => {
        const response = await app
          .patch(`${endpointUrl}/${nonExistingUserId}/bookmarks/offers/${nonExistingOfferId}`)
          .set('Cookie', [`accessToken=${accessToken}`])
          .send()

        expectError(404, DOCUMENT_NOT_FOUND([User.modelName]), response)
      })

      it('should throw 400 BAD_REQUEST if the offer id is not valid', async () => {
        const invalidOfferId = 'invalidOfferId'

        const response = await app
          .patch(`${endpointUrl}/${user._id}/bookmarks/offers/${invalidOfferId}`)
          .set('Cookie', [`accessToken=${accessToken}`])
          .send()

        expectError(400, INVALID_ID, response)
      })

      it('should throw 404 DOCUMENT_NOT_FOUND if an offer is not found', async () => {
        const response = await app
          .patch(`${endpointUrl}/${user._id}/bookmarks/offers/${nonExistingOfferId}`)
          .set('Cookie', [`accessToken=${accessToken}`])
          .send()

        expectError(404, DOCUMENT_NOT_FOUND([Offer.modelName]), response)
      })

      it('should add an offer id to bookmarks', async () => {
        user = await User.create({ ...testUser, bookmarkedOffers: [] })
        const offer = await Offer.create(testOffer)

        const response = await app
          .patch(`${endpointUrl}/${user._id.toString()}/bookmarks/offers/${offer._id.toString()}`)
          .set('Cookie', [`accessToken=${accessToken}`])
          .send()

        const updatedUser = await User.findById(user._id).select('+bookmarkedOffers')

        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual([offer._id.toString()])
        expect(updatedUser.bookmarkedOffers).toEqual([offer._id])
      })

      it('should remove an offer id from bookmarks', async () => {
        const offer1 = await Offer.create(testOffer)
        const offer2 = await Offer.create(testOffer)
        user = await User.create({ ...testUser, bookmarkedOffers: [offer1._id, offer2._id] })

        const response = await app
          .patch(`${endpointUrl}/${user._id.toString()}/bookmarks/offers/${offer2._id.toString()}`)
          .set('Cookie', [`accessToken=${accessToken}`])
          .send()

        const updatedUser = await User.findById(user._id).select('+bookmarkedOffers')

        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual([offer1._id.toString()])
        expect(updatedUser.bookmarkedOffers).toEqual([offer1._id])
      })
    })

    describe(`GET ${endpointUrl}:id/offers/bookmarks`, () => {
      let userAuthor
      const subjectName = 'Test Subject Name'
      let subjectId
      let category

      beforeEach(async () => {
        userAuthor = await User.create(testUser)

        await checkCategoryExistence()
        const categoryResponse = await Category.find()
        const { _id, appearance } = categoryResponse[0]
        category = { _id: _id.toString(), appearance }

        const subjectResponse = await app
          .post('/subjects/')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send({
            name: subjectName,
            category: category
          })
        subjectId = subjectResponse.body._id

        testOffer.category = category
        testOffer.subject = subjectId
        testOffer.author = userAuthor._id
      })

      it('should throw 404 DOCUMENT_NOT_FOUND if a user is not found', async () => {
        await User.deleteMany({})
        const response = await app
          .get(`${endpointUrl}/${nonExistingUserId}/bookmarks/offers/`)
          .set('Cookie', [`accessToken=${accessToken}`])
          .send()

        expectError(404, DOCUMENT_NOT_FOUND([User.modelName]), response)
      })

      it('should get bookmarked offers', async () => {
        const offer = await Offer.create(testOffer)
        const user = await User.create({ ...testUser, bookmarkedOffers: [offer._id] })

        const response = await app
          .get(`${endpointUrl}${user._id.toString()}/bookmarks/offers`)
          .set('Cookie', [`accessToken=${accessToken}`])
          .send()

        const expectedOffer = JSON.parse(JSON.stringify(offer))
        const expectedAuthor = {
          _id: userAuthor._id,
          firstName: userAuthor.firstName,
          lastName: userAuthor.lastName,
          averageRating: userAuthor.averageRating,
          totalReviews: userAuthor.totalReviews,
          nativeLanguage: userAuthor.nativeLanguage,
          photo: userAuthor.photo,
          professionalSummary: userAuthor.professionalSummary,
          status: userAuthor.status
        }
        expectedOffer.author = expectedAuthor
        expectedOffer.subject = { name: subjectName, _id: subjectId }
        expectedOffer.category = category
        expectedOffer.chatId = null

        expect(response.statusCode).toBe(200)
        expect(response.body).toMatchObject({ count: 1, items: [expectedOffer] })
      })

      it('should find a bookmarked offer with a specified title', async () => {
        const offer1Title = 'Offer1'
        const offer2Title = 'Offer2'

        testOffer.title = offer1Title
        const offer1 = await Offer.create(testOffer)

        testOffer.title = offer2Title
        const offer2 = await Offer.create(testOffer)

        const user = await User.create({ ...testUser, bookmarkedOffers: [offer1._id, offer2._id] })

        const response = await app
          .get(`${endpointUrl}${user._id.toString()}/bookmarks/offers?title=${offer1Title}`)
          .set('Cookie', [`accessToken=${accessToken}`])
          .send()

        const expectedOffer = JSON.parse(JSON.stringify(offer1))
        const expectedAuthor = {
          _id: userAuthor._id,
          firstName: userAuthor.firstName,
          lastName: userAuthor.lastName,
          averageRating: userAuthor.averageRating,
          totalReviews: userAuthor.totalReviews,
          nativeLanguage: userAuthor.nativeLanguage,
          photo: userAuthor.photo,
          professionalSummary: userAuthor.professionalSummary,
          status: userAuthor.status
        }
        expectedOffer.author = expectedAuthor
        expectedOffer.subject = { name: subjectName, _id: subjectId }
        expectedOffer.category = category
        expectedOffer.chatId = null

        expect(response.statusCode).toBe(200)
        expect(response.body).toMatchObject({ count: 1, items: [expectedOffer] })
      })
    })
  })
  describe('Restricted endpoints only by admin access rights', () => {
    let accessToken, currentUser

    beforeEach(async () => {
      accessToken = await testUserAuthentication(app, adminUser)
      currentUser = TokenService.validateAccessToken(accessToken)
    })

    afterEach(async () => {
      await app.post(logoutEndpoint)
    })

    describe(`UPDATE ${endpointUrl}:id/change-status`, () => {
      const changeStatusPath = '/change-status'
      const mockedStatus = { tutor: STATUS_ENUM[0] }

      it('should UPDATE user by ID', async () => {
        const response = await app
          .patch(endpointUrl + currentUser.id + changeStatusPath)
          .send(mockedStatus)
          .set('Cookie', [`accessToken=${accessToken}`])

        expect(response.statusCode).toBe(204)
      })

      it('should throw DOCUMENT_NOT_FOUND', async () => {
        const response = await app
          .patch(endpointUrl + nonExistingUserId + changeStatusPath)
          .send(mockedStatus)
          .set('Cookie', [`accessToken=${accessToken}`])

        expectError(404, DOCUMENT_NOT_FOUND([User.modelName]), response)
      })

      it('should throw FORBIDDEN', async () => {
        await app.post(logoutEndpoint)

        const noPermissionsAccessToken = await testUserAuthentication(app, {
          ...testUser,
          role: TUTOR
        })
        const userWithNoPermissions = TokenService.validateAccessToken(noPermissionsAccessToken)

        const response = await app
          .patch(endpointUrl + userWithNoPermissions.id + changeStatusPath)
          .send(mockedStatus)
          .set('Cookie', [`accessToken=${noPermissionsAccessToken}`])

        expectError(403, FORBIDDEN, response)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.patch(endpointUrl + currentUser._id + changeStatusPath).send(mockedStatus)

        expectError(401, UNAUTHORIZED, response)
      })
    })

    describe(`DELETE ${endpointUrl}:id`, () => {
      it('should DELETE user by ID', async () => {
        const response = await app.delete(endpointUrl + currentUser.id).set('Cookie', [`accessToken=${accessToken}`])

        expect(response.statusCode).toBe(204)
      })

      it('should throw DOCUMENT_NOT_FOUND', async () => {
        const response = await app.delete(endpointUrl + nonExistingUserId).set('Cookie', [`accessToken=${accessToken}`])

        expectError(404, DOCUMENT_NOT_FOUND([User.modelName]), response)
      })

      it('should throw FORBIDDEN', async () => {
        await app.post(logoutEndpoint)

        const noPermissionsAccessToken = await testUserAuthentication(app, {
          ...testUser,
          role: TUTOR
        })
        const userWithNoPermissions = TokenService.validateAccessToken(noPermissionsAccessToken)

        const response = await app
          .delete(endpointUrl + userWithNoPermissions.id)
          .set('Cookie', [`accessToken=${noPermissionsAccessToken}`])

        expectError(403, FORBIDDEN, response)
      })

      it('should throw private DOCUMENT_NOT_FOUND', async () => {
        await expect(
          userService.privateUpdateUser(nonExistingUserId, {
            firstName: 'NewName'
          })
        ).rejects.toThrow('User with the specified ID was not found.')
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.delete(endpointUrl + testUser._id)

        expectError(401, UNAUTHORIZED, response)
      })
    })

    describe('createAggregateOptions block', () => {
      it('should handle boolean isFirstLogin field', () => {
        const optionsTrue = createAggregateOptions({ isFirstLogin: 'true' }).match.isFirstLogin.$in
        expect(optionsTrue).toEqual([true])

        const optionsFalse = createAggregateOptions({ isFirstLogin: 'false' }).match.isFirstLogin.$in
        expect(optionsFalse).toEqual([false])
      })

      it('should handle limit and skip fields', () => {
        const options = createAggregateOptions({
          limit: createAggregateFields.limit,
          skip: createAggregateFields.skip
        })

        expect(options.limit).toEqual(parseInt(createAggregateFields.limit))
        expect(options.skip).toEqual(parseInt(createAggregateFields.skip))
      })

      it('should handle sort by name correct', () => {
        const options = createAggregateOptions({
          sort: {
            orderBy: createAggregateFields.orderBy,
            order: createAggregateFields.order
          }
        }).sort

        expect(options).toEqual({ firstName: 1, lastName: 1 })
      })

      it('should include role in match object when role is provided', () => {
        const options = createAggregateOptions({
          role: createAggregateFields.role
        }).match

        expect(options.role).toEqual(createAggregateFields.role)
      })

      it('should include both conditions when dates are provided', () => {
        const options = createAggregateOptions({
          lastLogin: {
            from: createAggregateFields.from,
            to: createAggregateFields.to
          }
        }).match.lastLogin

        expect(options.$gte).toEqual(new Date(createAggregateFields.from))
        expect(options.$lte).toEqual(new Date(new Date(createAggregateFields.to).setHours(23, 59, 59)))
      })

      it('should handle status when the role is provided', () => {
        const options = createAggregateOptions({
          status: createAggregateFields.status,
          role: createAggregateFields.role
        }).match['status.' + createAggregateFields.role]

        expect(options).toEqual({ $in: createAggregateFields.status })
      })

      it('should handle mixed array with boolean strings', () => {
        const options = createAggregateOptions({
          isFirstLogin: ['true', 'false']
        }).match.isFirstLogin.$in

        expect(options).toEqual([true, false])
      })
    })

    describe('getUserById block', () => {
      beforeAll(async () => {
        userStudent = await User.create({
          role: 'student',
          firstName: 'Anna',
          lastName: 'Douglas',
          email: 'anna123@gmail.com',
          password: 'password',
          appLanguage: 'en',
          mainSubjects: {
            student: [{ category: { _id: new mongoose.Types.ObjectId(), name: 'Cooking' }, subjects: [] }],
            tutor: []
          }
        })

        userAdmin = await User.create({
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin.user@admin.com',
          password: 'adminpassword',
          appLanguage: 'en'
        })
      })

      afterAll(async () => {
        await User.deleteMany({
          email: {
            $in: ['anna123@gmail.com', 'admin.user@admin.com']
          }
        })
      })

      it('should return the user regardless of their role when no role is specified', async () => {
        const foundUser = await userService.getUserById(userStudent._id)
        expect(foundUser).toBeTruthy()
        expect(foundUser.email).toBe('anna123@gmail.com')
      })

      it('should not return the user if the specified role does not match', async () => {
        const foundUser = await userService.getUserById(userAdmin._id, 'student')
        expect(foundUser).toBeNull()
      })
    })

    describe('createUser block', () => {
      beforeEach(async () => {
        await User.create({
          role: 'student',
          firstName: 'Existing',
          lastName: 'User',
          email: 'existing.email@example.com',
          password: 'password',
          appLanguage: 'en',
          isEmailConfirmed: true
        })
      })

      afterEach(async () => {
        await User.deleteMany({ email: 'existing.email@example.com' })
      })

      it('should throw a 409 error if a user with the given email already exists', async () => {
        await expect(
          userService.createUser('student', 'Vika', 'Anderson', 'existing.email@example.com', 'password123', 'en')
        ).rejects.toThrowError(new Error('User with the specified email already exists.'))
      })
    })

    it('should throw a 404 error if no user is found with the given ID', async () => {
      await expect(userService.updateUser(nonExistingUserId, 'student', {})).rejects.toThrowError(
        'User with the specified ID was not found.'
      )
    })

    it('should delete the users existing photo if one exists and the photo data was sent', async () => {
      const mockDeleteFile = jest.spyOn(uploadService, 'deleteFile').mockResolvedValue(null)

      const userWithPhoto = await User.create({
        firstName: 'Anna',
        lastName: 'Douglas',
        email: 'anna123@gmail.com',
        password: 'password123',
        photo: 'http://example.com/photo.jpg'
      })

      await userService.updateUser(userWithPhoto._id.toString(), userWithPhoto.role, {
        firstName: 'UpdatedName',
        photo: null
      })

      expect(mockDeleteFile).toHaveBeenCalledWith('http://example.com/photo.jpg', USER)

      mockDeleteFile.mockRestore()
    })

    it('should upload a new photo and update the users photo', async () => {
      const mockUploadFile = jest
        .spyOn(uploadService, 'uploadFile')
        .mockResolvedValue('http://example.com/newPhoto.jpg')

      const user = await User.create({
        firstName: 'Oleg',
        lastName: 'Mongol',
        email: 'o.mongodb76@example.com',
        password: '12345deutchsecurity'
      })

      const newPhotoData = {
        name: 'newPhoto.jpg',
        src: 'data:image/jpegbase64,...'
      }

      await userService.updateUser(user._id.toString(), user.role, { photo: newPhotoData })

      expect(mockUploadFile).toHaveBeenCalledWith(newPhotoData.name, expect.any(Buffer), USER)

      const updatedUser = await User.findById(user._id)

      expect(updatedUser.photo).toBe('http://example.com/newPhoto.jpg')

      mockUploadFile.mockRestore()
    })
  })
})

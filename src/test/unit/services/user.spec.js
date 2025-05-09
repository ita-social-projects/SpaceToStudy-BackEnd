const userService = require('~/services/user')
const offerService = require('~/services/offer')
const cooperationService = require('~/services/cooperation')
const User = require('~/models/user')
const Offer = require('~/models/offer')
const uploadService = require('~/services/upload')
const notificationService = require('~/services/notification')
const attachmentService = require('~/services/attachment')
const lessonService = require('~/services/lesson')
const quizService = require('~/services/quiz')
const questionService = require('~/services/question')
const resourcesCategoryService = require('~/services/resourcesCategory')
const noteService = require('~/services/note')
const courseService = require('~/services/course')
const tokenService = require('~/services/token')
const reviewService = require('~/services/review')
const chatService = require('~/services/chat')
const messageService = require('~/services/message')
const { hashPassword } = require('~/utils/passwordHelper')
const { FORBIDDEN, DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')
const {
  enums: { OFFER_STATUS_ENUM }
} = require('~/consts/validation')

jest.mock('~/models/offer')
jest.mock('~/services/offer')
jest.mock('~/services/cooperation')
jest.mock('~/utils/passwordHelper')

describe('User service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    jest.clearAllMocks()

    User.countDocuments = jest.fn().mockResolvedValue(2)
    User.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      collation: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ name: 'John' }, { name: 'Jane' }])
    })

    User.findById = jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({ _id: '1', mainSubjects: { tutor: [] } })
    })

    User.findByIdAndUpdate = jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({})
    })

    Offer.aggregate = jest.fn().mockResolvedValue([])

    Offer.countDocuments = jest.fn().mockResolvedValue(10)
    Offer.findByIdAndUpdate = jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({})
    })

    Offer.calcTotalOffers = jest.fn().mockResolvedValue()

    offerService.getOffers = jest.fn().mockResolvedValue([])

    cooperationService.getCooperations = jest.fn().mockResolvedValue([])
  })

  describe('getUsers', () => {
    it('should return users and count based on match, sort, skip, limit', async () => {
      const match = { role: 'tutor' }
      const sort = { name: 1 }
      const skip = 0
      const limit = 10

      const result = await userService.getUsers({ match, sort, skip, limit })

      expect(User.countDocuments).toHaveBeenCalledWith(match)
      expect(User.find).toHaveBeenCalledWith(match)
      expect(result).toEqual({ items: [{ name: 'John' }, { name: 'Jane' }], count: 2 })
    })
  })

  describe('getUserByEmail', () => {
    it('should return user based on email', async () => {
      const email = 'test@example.com'
      const mockUser = {
        _id: '123',
        email
      }

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser)
      })

      const result = await userService.getUserByEmail(email)

      expect(User.findOne).toHaveBeenCalledWith({ email })
      expect(result).toEqual(mockUser)
    })

    it('should return null if user not found', async () => {
      const email = 'missing@example.com'

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      })

      const result = await userService.getUserByEmail(email)

      expect(User.findOne).toHaveBeenCalledWith({ email })
      expect(result).toBeNull()
    })
  })

  describe('createUser', () => {
    const mockUser = {
      _id: '123',
      role: 'tutor',
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
      isEmailConfirmed: 'true',
      appLanguage: 'uk'
    }

    it('should throw 409 error if user with given email already exists', async () => {
      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockUser)
      try {
        await userService.createUser(
          mockUser.role,
          mockUser.firstName,
          mockUser.lastName,
          mockUser.email,
          mockUser.password,
          mockUser.appLanguage
        )
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
        expect(err.status).toBe(409)
      }
    })

    it('should throw 400 error if role is ADMIN', async () => {
      const mockAdminUser = {
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'adminPass123',
        appLanguage: 'en'
      }

      try {
        await userService.createUser(
          mockAdminUser.role,
          mockAdminUser.firstName,
          mockAdminUser.lastName,
          mockAdminUser.email,
          mockAdminUser.password,
          mockAdminUser.appLanguage
        )
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
        expect(err.status).toBe(400)
      }
    })

    it('should hash the password before saving the user', async () => {
      const mockPassword = 'plainPassword123'
      const mockHashedPassword = 'hashedPassword123'
      const mockUser = {
        role: 'tutor',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: mockPassword,
        appLanguage: 'uk'
      }

      hashPassword.mockResolvedValue(mockHashedPassword)
      jest.spyOn(User, 'create').mockResolvedValue({ _id: '1' })

      await userService.createUser(
        mockUser.role,
        mockUser.firstName,
        mockUser.lastName,
        mockUser.email,
        mockUser.password,
        mockUser.appLanguage
      )

      expect(hashPassword).toHaveBeenCalledWith(mockPassword)
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: mockHashedPassword
        })
      )
    })
  })

  describe('privateUpdateUser', () => {
    it('should update user if user exists', async () => {
      const id = '123'
      const updateData = { firstName: 'Mike' }
      const mockUpdatedUser = { _id: id, ...updateData }

      jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedUser)
      })

      await expect(userService.privateUpdateUser(id, updateData)).resolves.toBeUndefined()

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true })
    })

    it('should throw 404 if user not found', async () => {
      const id = 'nonexistent'
      const updateData = { lastName: 'Night' }

      jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(userService.privateUpdateUser(id, updateData)).rejects.toThrow(
        createError(404, DOCUMENT_NOT_FOUND([User.modelName]))
      )
    })
  })

  describe('_updateMainSubjects', () => {
    it('should update main subjects correctly', async () => {
      const mainSubject = { tutor: [{ _id: '1', category: { _id: '1', name: 'Math' } }] }
      const userSubjects = { tutor: [{ _id: '2', category: { name: 'Physics' } }] }
      const role = 'tutor'
      const userId = '123'

      const result = await userService._updateMainSubjects(mainSubject, userSubjects, role, userId)

      const expected = [{ category: { _id: '1', name: 'Math' } }]

      delete result[role]?.[0]?._id

      expect(result[role]).toEqual(expect.arrayContaining(expected))
    })

    it('should group subjects by category', async () => {
      const mainSubjects = {
        tutor: [
          {
            _id: '66cded8558c020b5a598318a',
            category: { _id: '1', name: 'Math' },
            subjects: [
              { _id: '1', name: 'First' },
              { _id: '2', name: 'Second' }
            ]
          },
          { _id: '3', category: { _id: '42', name: 'Physics' }, subjects: [] }
        ]
      }
      const userSubjects = { tutor: [{ _id: '3', category: { _id: '42', name: 'Physics' }, subjects: [] }] }
      const role = 'tutor'
      const userId = '123'

      const result = await userService._updateMainSubjects(mainSubjects, userSubjects, role, userId)

      const expected = [
        {
          _id: '66cded8558c020b5a598318a',
          category: { _id: '1', name: 'Math' },
          subjects: [
            { _id: '1', name: 'First' },
            { _id: '2', name: 'Second' }
          ]
        },
        { _id: '3', category: { _id: '42', name: 'Physics' }, subjects: [] }
      ]
      expect(result.tutor).toEqual(expect.arrayContaining(expected))
    })

    it('should convert mainSubjects to array if not already an array', async () => {
      const mainSubject = {
        tutor: {
          _id: '66cdf3e053f8bf9483c93fbc',
          category: { _id: '1', name: 'Math' },
          subjects: [{ _id: '1', name: 'Some' }]
        }
      }
      const userSubjects = { tutor: [{ _id: '2', category: { name: 'Physics' } }] }
      const role = 'tutor'
      const userId = '123'

      const result = await userService._updateMainSubjects(mainSubject, userSubjects, role, userId)

      const expected = [
        {
          _id: '66cdf3e053f8bf9483c93fbc',
          category: { _id: '1', name: 'Math' },
          subjects: [{ _id: '1', name: 'Some' }]
        }
      ]
      expect(result.tutor).toEqual(expect.arrayContaining(expected))
    })

    it('should throw FORBIDDEN if deletion is blocked', async () => {
      const mainSubject = [{ _id: '1', category: { _id: '', name: '' } }]
      const userSubjects = { tutor: [{ _id: '1', category: { _id: '1', name: 'Math' } }] }
      const role = 'tutor'
      const userId = '123'

      jest.spyOn(userService, '_calculateDeletionMainSubject').mockResolvedValue(true)

      await expect(userService._updateMainSubjects(mainSubject, userSubjects, role, userId)).rejects.toThrow(FORBIDDEN)
    })

    it('should remove main subject if it is to be deleted and verifyDeletionSubject works', async () => {
      const mainSubject = {
        _id: '1',
        category: { _id: '1', name: '' }
      }
      const userSubjects = {
        tutor: [
          {
            _id: '1',
            category: { _id: '1', name: 'Math' },
            subjects: [
              { _id: '2', name: 'Algebra' },
              { _id: '3', name: 'Geometry' }
            ]
          }
        ]
      }
      const role = 'tutor'
      const userId = '123'

      jest.spyOn(userService, '_calculateDeletionMainSubject').mockResolvedValue(false)

      const result = await userService._updateMainSubjects(mainSubject, userSubjects, role, userId)

      expect(result.tutor).toEqual(expect.arrayContaining([]))
    })

    it('should update main subject if it already exists', async () => {
      const mainSubject = {
        tutor: [{ _id: '1', category: { _id: '1', name: 'Math' }, subjects: [{ _id: '2', name: 'Algebra' }] }]
      }
      const userSubjects = {
        tutor: [{ _id: '1', category: { _id: '1', name: 'Math' }, subjects: [{ _id: '2', name: 'Algebra' }] }]
      }
      const role = 'tutor'
      const userId = '123'

      const result = await userService._updateMainSubjects(mainSubject, userSubjects, role, userId)

      expect(result.tutor).toHaveLength(1)
      expect(result.tutor[0]._id).toBe('1')
      expect(result.tutor[0].category._id).toBe('1')
      expect(result.tutor[0].category.name).toBe('Math')
      expect(result.tutor[0].subjects).toEqual([{ _id: '2', name: 'Algebra' }])
    })

    it('should skip subject update if either subject or dbSubject has no _id', async () => {
      const mainSubject = {
        tutor: [{ category: { _id: '1', name: 'Math' } }]
      }

      const userSubjects = {
        tutor: [{ _id: '2', category: { _id: '2', name: 'Physics' } }]
      }

      const role = 'tutor'
      const userId = '123'

      const result = await userService._updateMainSubjects(mainSubject, userSubjects, role, userId)

      expect(result.tutor).toEqual(expect.arrayContaining([]))
    })
  })

  describe('_calculateDeletionMainSubject', () => {
    it('should return false if user has no offers and no cooperations', async () => {
      const aggregateOptions = [{ $match: { category: 'cat1', author: '123', status: OFFER_STATUS_ENUM[0] } }]
      jest.spyOn(offerService, 'getOffers').mockResolvedValue(null)
      jest.spyOn(cooperationService, 'getCooperations').mockResolvedValue(null)

      const result = await userService._calculateDeletionMainSubject('123', 'cat1')

      expect(offerService.getOffers).toHaveBeenCalledWith(aggregateOptions)
      expect(cooperationService.getCooperations).toHaveBeenCalledWith(aggregateOptions)
      expect(result).toBe(false)
    })
  })

  describe('updateUser', () => {
    it('should call _updateMainSubjects if mainSubjects is in updateData', async () => {
      const id = '123'
      const role = 'tutor'
      const updateData = { mainSubjects: [{ _id: '1', category: { _id: '1', name: 'Math' } }] }

      const userMock = {
        _id: id,
        mainSubjects: { tutor: [{ _id: '2', category: { name: 'Physics' } }] }
      }

      jest.spyOn(User, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(userMock)
      })

      jest.spyOn(userService, '_updateMainSubjects').mockResolvedValue(updateData.mainSubjects)
      jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(userMock)
      })

      await userService.updateUser(id, role, updateData)

      expect(userService._updateMainSubjects).toHaveBeenCalledWith(
        updateData.mainSubjects,
        userMock.mainSubjects,
        role,
        id
      )
    })

    it('should check for deletion block when isEdit is true', async () => {
      const userId = '123'
      const role = 'tutor'
      const isEdit = true

      const userMock = {
        _id: userId,
        mainSubjects: {
          tutor: [{ _id: '1', category: { _id: '1', name: 'Math' } }]
        }
      }

      const expectedSubject = {
        _id: '1',
        category: { _id: '1', name: 'Math' },
        isDeletionBlocked: true
      }

      jest.spyOn(User, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(userMock)
      })

      jest.spyOn(userService, '_calculateDeletionMainSubject').mockImplementation((userId, categoryId) => {
        return categoryId === '1'
      })

      const result = await userService.getUserById(userId, role, isEdit)

      expect(result.mainSubjects.tutor[0]).toEqual(expect.objectContaining(expectedSubject))
    })

    it('should log error if _calculateDeletionMainSubject throws an error when isEdit is true', async () => {
      const userId = '123'
      const role = 'tutor'
      const isEdit = true

      const userMock = {
        _id: userId,
        mainSubjects: {
          tutor: [{ _id: '1', category: { _id: '1', name: 'Math' } }]
        }
      }

      jest.spyOn(User, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(userMock)
      })

      const error = new Error('Test error')
      jest.spyOn(userService, '_calculateDeletionMainSubject').mockImplementation(() => {
        throw error
      })

      console.log = jest.fn()

      await userService.getUserById(userId, role, isEdit)

      expect(console.log).toHaveBeenCalledWith(error)
    })

    it('should update videoLink if it is in updateData', async () => {
      const id = '123'
      const role = 'tutor'
      const updateData = { videoLink: 'newVideoLink.com' }

      const userMock = {
        _id: id,
        videoLink: { tutor: 'oldVideoLink.com' }
      }

      jest.spyOn(User, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(userMock)
      })

      jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(userMock)
      })

      await userService.updateUser(id, role, updateData)

      const expectedVideoLink = { ...userMock.videoLink, [role]: updateData.videoLink }
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        expect.objectContaining({ videoLink: expectedVideoLink }),
        expect.anything()
      )
    })

    it('should throw DOCUMENT_NOT_FOUND error if user is not found', async () => {
      const id = '123'
      const updateStatus = { tutor: 'active' }

      jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(userService.updateStatus(id, updateStatus)).rejects.toThrow(DOCUMENT_NOT_FOUND([User.modelName]))
    })

    it('should delete previous photo if shouldDeletePreviousPhoto returns true', async () => {
      const id = '123'
      const role = 'tutor'
      const userMock = {
        _id: id,
        photo: 'oldPhotoUrl'
      }

      const updateData = {
        photo: {
          src: 'data:image/png;base64,ZmFrZUJhc2U2NA==',
          name: 'new-photo.png'
        }
      }

      jest.spyOn(User, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(userMock)
      })

      jest.spyOn(userService, '_updateMainSubjects').mockResolvedValue([])
      jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({})
      })

      const deleteSpy = jest.spyOn(uploadService, 'deleteFile').mockResolvedValue()
      jest.mock('~/utils/users/photoCheck', () => ({
        shouldDeletePreviousPhoto: jest.fn().mockReturnValue(true)
      }))

      jest.spyOn(uploadService, 'uploadFile').mockResolvedValue('newPhotoUrl')

      await userService.updateUser(id, role, updateData)

      expect(deleteSpy).toHaveBeenCalledWith('oldPhotoUrl', 'user')
    })

    it('should throw DOCUMENT_NOT_FOUND error if user is not found', async () => {
      const id = 'non-existent-id'
      const role = 'tutor'
      const updateData = { firstName: 'NewName' }

      jest.spyOn(User, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(userService.updateUser(id, role, updateData)).rejects.toThrow(
        createError(404, DOCUMENT_NOT_FOUND([User.modelName]))
      )
    })
  })

  describe('updateLastSeen', () => {
    it('should update lastSeen field', async () => {
      const id = '123'
      const userMock = {
        _id: '123'
      }

      jest.spyOn(User, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(userMock)
      })

      jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(userMock)
      })

      await userService.updateLastSeen(id)

      expect(User.findById).toHaveBeenCalledWith(id)
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(id, { $set: { lastSeen: expect.any(Number) } }, { new: true })
    })

    it('should throw a 404 error if user is not found', async () => {
      const id = 'non-existent id'

      jest.spyOn(User, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(userService.updateLastSeen(id)).rejects.toThrow(
        createError(404, DOCUMENT_NOT_FOUND([User.modelName]))
      )

      expect(User.findById).toHaveBeenCalledWith(id)
    })
  })

  describe('Ownership and Availability Services', () => {
    const userId = '1'
    const invalidUserId = '10'
    const lessonResource = {
      _id: '665826b3e82dd6b547d60630',
      author: '660a8c7da2f78d2ed869b2bf'
    }
    const cooperationResource = {
      _id: '673c591d37cd0271ea16d634',
      initiator: '1',
      receiver: '3',
      sections: [
        {
          resources: [
            {
              resource: '665826b3e82dd6b547d60630',
              resourceType: 'lesson',
              availability: 'open'
            }
          ]
        }
      ]
    }

    const mockLessonModel = {
      findById: jest.fn(),
      findOne: jest.fn()
    }

    const mockCooperationModel = {
      findOne: jest.fn()
    }

    const MODEL_CONFIGS = {
      CooperationModel: {
        model: mockCooperationModel,
        ownerFields: ['author', 'initiator', 'receiver'],
        dynamicPaths: {
          sectionsResources: 'sections.resources',
          resourceField: 'resource',
          userFields: ['initiator', 'receiver'],
          availabilityField: 'availability'
        }
      }
    }

    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('checkOwnership', () => {
      it('should return the lesson if user is an owner (initiator or receiver) via cooperation', async () => {
        mockLessonModel.findById.mockResolvedValue(lessonResource)
        mockCooperationModel.findOne.mockResolvedValue(cooperationResource)

        const result = await userService.checkOwnership(
          mockLessonModel,
          ['initiator', 'receiver'],
          lessonResource._id,
          userId,
          MODEL_CONFIGS.CooperationModel
        )

        expect(result).toEqual(lessonResource)
        expect(mockLessonModel.findById).toHaveBeenCalledWith(lessonResource._id)
        expect(mockCooperationModel.findOne).toHaveBeenCalledWith({
          'sections.resources': {
            $elemMatch: { resource: lessonResource._id }
          },
          $or: [{ initiator: userId }, { receiver: userId }]
        })
      })

      it('should throw a 404 error if the resource does not exist', async () => {
        mockLessonModel.findById.mockResolvedValue(null)

        await expect(
          userService.checkOwnership(mockLessonModel, ['initiator', 'receiver'], lessonResource._id, userId)
        ).rejects.toThrowError(createError(404, DOCUMENT_NOT_FOUND([mockLessonModel.modelName])))
      })

      it('should throw a 403 error if the user is not an owner or related via cooperation', async () => {
        mockLessonModel.findById.mockResolvedValue(lessonResource)
        mockCooperationModel.findOne.mockResolvedValue(null)

        await expect(
          userService.checkOwnership(
            mockLessonModel,
            ['initiator', 'receiver'],
            lessonResource._id,
            invalidUserId,
            MODEL_CONFIGS.CooperationModel
          )
        ).rejects.toThrowError(createError(403, FORBIDDEN))
      })

      it('should return the lesson if user is a direct owner', async () => {
        const directOwnerLessonResource = {
          ...lessonResource,
          initiator: userId
        }
        mockLessonModel.findById.mockResolvedValue(directOwnerLessonResource)

        const result = await userService.checkOwnership(
          mockLessonModel,
          ['initiator', 'receiver'],
          directOwnerLessonResource._id,
          userId
        )

        expect(result).toEqual(directOwnerLessonResource)
        expect(mockLessonModel.findById).toHaveBeenCalledWith(directOwnerLessonResource._id)
      })

      it('should throw a 403 error if relationshipModel is not provided and user is not a direct owner', async () => {
        const unrelatedLessonResource = {
          ...lessonResource,
          initiator: '2',
          receiver: '3'
        }
        mockLessonModel.findById.mockResolvedValue(unrelatedLessonResource)

        await expect(
          userService.checkOwnership(mockLessonModel, ['initiator', 'receiver'], unrelatedLessonResource._id, userId)
        ).rejects.toThrowError(createError(403, FORBIDDEN))
      })
    })

    describe('checkAvailability', () => {
      beforeEach(() => {
        jest.clearAllMocks()
      })

      it('should return true if the user is the author of the resource', async () => {
        const lessonResourceWithAuthor = {
          ...lessonResource,
          author: userId
        }

        mockLessonModel.findOne.mockResolvedValue(lessonResourceWithAuthor)

        const result = await userService.checkAvailability({
          model: mockLessonModel,
          relationshipModel: MODEL_CONFIGS.CooperationModel,
          resourceId: lessonResource._id,
          userId,
          expectedAvailability: 'open'
        })

        expect(result).toBe(true)
        expect(mockLessonModel.findOne).toHaveBeenCalledWith({
          _id: lessonResource._id,
          author: userId
        })
      })

      it('should return true if the resource has the expected availability', async () => {
        const availabilityQuery = {
          [MODEL_CONFIGS.CooperationModel.dynamicPaths.sectionsResources]: {
            $elemMatch: {
              [MODEL_CONFIGS.CooperationModel.dynamicPaths.resourceField]: lessonResource._id,
              [MODEL_CONFIGS.CooperationModel.dynamicPaths.availabilityField]: 'open'
            }
          }
        }

        mockLessonModel.findOne.mockResolvedValue(null)
        mockCooperationModel.findOne.mockResolvedValue(cooperationResource)

        const result = await userService.checkAvailability({
          model: mockLessonModel,
          relationshipModel: MODEL_CONFIGS.CooperationModel,
          resourceId: lessonResource._id,
          userId,
          expectedAvailability: 'open'
        })

        expect(result).toBe(true)
        expect(mockCooperationModel.findOne).toHaveBeenCalledWith(availabilityQuery)
      })

      it('should throw a 403 error if the user is neither the author nor the resource is available', async () => {
        mockLessonModel.findOne.mockResolvedValue(null)
        mockCooperationModel.findOne.mockResolvedValue(null)

        await expect(
          userService.checkAvailability({
            model: mockLessonModel,
            relationshipModel: MODEL_CONFIGS.CooperationModel,
            resourceId: lessonResource._id,
            userId,
            expectedAvailability: 'open'
          })
        ).rejects.toThrowError(createError(403, FORBIDDEN))
      })
    })
  })

  describe('deleteUser', () => {
    it('should call one deletion service and remove the user', async () => {
      jest.spyOn(notificationService, 'clearNotifications').mockResolvedValue()
      jest.spyOn(attachmentService, 'deleteAttachmentsByAuthor').mockResolvedValue()
      jest.spyOn(lessonService, 'deleteLessonsByAuthor').mockResolvedValue()
      jest.spyOn(quizService, 'deleteQuizzesByAuthor').mockResolvedValue()
      jest.spyOn(questionService, 'deleteQuestionsByAuthor').mockResolvedValue()
      jest.spyOn(resourcesCategoryService, 'deleteResourceCategoriesByAuthor').mockResolvedValue()
      jest.spyOn(noteService, 'deleteNotesByAuthor').mockResolvedValue()
      jest.spyOn(courseService, 'deleteCoursesByAuthor').mockResolvedValue()
      jest.spyOn(reviewService, 'deleteReviewsByAuthorOrTarget').mockResolvedValue()
      jest.spyOn(cooperationService, 'deleteCooperationsByUser').mockResolvedValue()
      jest.spyOn(offerService, 'deleteOffersByAuthor').mockResolvedValue()
      jest.spyOn(chatService, 'deleteChatsbyUser').mockResolvedValue()
      jest.spyOn(messageService, 'deleteAllMessagesByUser').mockResolvedValue()
      jest.spyOn(tokenService, 'deleteTokensByUser').mockResolvedValue()

      const id = '123'

      const removeSpy = jest.spyOn(User, 'findByIdAndRemove').mockResolvedValue()

      await expect(userService.deleteUser(id)).resolves.toBeUndefined()
      expect(removeSpy).toHaveBeenCalledWith(id)
    })
  })

  describe('toggleOfferBookmark', () => {
    const offerId = '64c0d2a4e937a8d19b2f3c1b'
    const userId = '64c0d2a4e937a8d19b2f3c1a'

    it('should throw 404 if offer does not exist', async () => {
      jest.spyOn(Offer, 'findById').mockResolvedValue(null)

      await expect(userService.toggleOfferBookmark(offerId, userId)).rejects.toThrow(
        createError(404, DOCUMENT_NOT_FOUND([Offer.modelName]))
      )
    })

    it('should add offerId to bookmarkedOffers if not present', async () => {
      const mockOffer = { _id: offerId }

      const updatedUserMock = {
        _id: userId,
        bookmarkedOffers: [offerId]
      }

      jest.spyOn(Offer, 'findById').mockResolvedValue(mockOffer)

      jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUserMock)
      })

      const result = await userService.toggleOfferBookmark(offerId, userId)

      expect(result).toEqual([offerId])
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, expect.any(Array), { new: true })
    })

    it('should remove offerId from bookmarkedOffers if already present', async () => {
      const mockOffer = { _id: offerId }

      const updatedUserMock = {
        _id: userId,
        bookmarkedOffers: []
      }

      jest.spyOn(Offer, 'findById').mockResolvedValue(mockOffer)

      jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUserMock)
      })

      const result = await userService.toggleOfferBookmark(offerId, userId)

      expect(result).toEqual([])
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, expect.any(Array), { new: true })
    })
  })

  describe('getBookmarkedOffers', () => {
    const userId = '64c0d2a4e937a8d19b2f3c1a'

    it('should call aggregate with correct pipeline without title', async () => {
      const aggregateMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ offers: { items: ['offer1'], count: 1 } }])
      })

      jest.spyOn(User, 'aggregate').mockImplementation(aggregateMock)

      const result = await userService.getBookmarkedOffers(userId, {})

      expect(User.aggregate).toHaveBeenCalledWith(expect.any(Array))
      expect(result).toEqual({ items: ['offer1'], count: 1 })
    })

    it('should call aggregate with title filter in the pipeline', async () => {
      const queryParams = { title: 'math' }

      const aggregateMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ offers: { items: ['offer1', 'offer2'], count: 2 } }])
      })

      jest.spyOn(User, 'aggregate').mockImplementation(aggregateMock)

      const result = await userService.getBookmarkedOffers(userId, queryParams)

      expect(User.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $lookup: expect.objectContaining({
              pipeline: expect.arrayContaining([
                expect.objectContaining({
                  $match: expect.objectContaining({
                    title: expect.objectContaining({ $regex: queryParams.title })
                  })
                })
              ])
            })
          })
        ])
      )

      expect(result).toEqual({ items: ['offer1', 'offer2'], count: 2 })
    })

    it('should return empty offers and zero count if no results', async () => {
      jest.spyOn(User, 'aggregate').mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ offers: { items: [], count: 0 } }])
      })

      const result = await userService.getBookmarkedOffers(userId, {})

      expect(result).toEqual({ items: [], count: 0 })
    })
  })
})

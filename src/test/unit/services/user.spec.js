const userService = require('~/services/user')
const offerService = require('~/services/offer')
const cooperationService = require('~/services/cooperation')
const User = require('~/models/user')
const { FORBIDDEN, DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const {
  enums: { OFFER_STATUS_ENUM }
} = require('~/consts/validation')

describe('User service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  describe('_updateMainSubjects', () => {
    it('should update main subjects correctly', async () => {
      const mainSubject = [{ _id: '1', category: { _id: '1', name: 'Math' } }]
      const userSubjects = { tutor: [{ _id: '2', category: { name: 'Physics' } }] }
      const role = 'tutor'
      const userId = '123'

      const result = await userService._updateMainSubjects(mainSubject, userSubjects, role, userId)

      const expected = [
        { category: { _id: '1', name: 'Math' }, subjects: [{ _id: '1', name: undefined }] },
        { _id: '2', category: { name: 'Physics' } }
      ]
      expect(result.tutor).toEqual(expect.arrayContaining(expected))
    })

    it('should group subjects by category', async () => {
      const mainSubjects = [
        { _id: '1', category: { _id: '1', name: 'Math' } },
        { _id: '2', category: { _id: '1', name: 'Math' } }
      ]
      const userSubjects = { tutor: [{ _id: '3', category: { name: 'Physics' } }] }
      const role = 'tutor'
      const userId = '123'

      const result = await userService._updateMainSubjects(mainSubjects, userSubjects, role, userId)

      const expected = [
        {
          category: { _id: '1', name: 'Math' },
          subjects: [
            { _id: '1', name: undefined },
            { _id: '2', name: undefined }
          ]
        },
        { _id: '3', category: { name: 'Physics' } }
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

    it('should remove main subject if it is to be deleted', async () => {
      const mainSubject = [{ _id: '1', category: { _id: '1', name: 'Math' } }]
      const userSubjects = {
        tutor: [
          { _id: '1', category: { _id: '1', name: 'Math' } },
          { _id: '1', category: { _id: '1', name: 'Math' } }
        ]
      }
      const role = 'tutor'
      const userId = '123'

      jest.spyOn(userService, '_calculateDeletionMainSubject').mockImplementation((userId, categoryId) => {
        return categoryId !== '1'
      })

      const result = await userService._updateMainSubjects(mainSubject, userSubjects, role, userId)

      const expected = [
        { category: { _id: '1', name: 'Math' }, subjects: [{ _id: '1', name: undefined }] },
        { _id: '1', category: { _id: '1', name: 'Math' } }
      ]
      expect(result.tutor).toEqual(expect.arrayContaining(expected))
    })

    it('should update main subject if it already exists', async () => {
      const mainSubject = [{ _id: '1', category: { _id: '1', name: 'Math' } }]
      const userSubjects = { tutor: [{ _id: '1', category: { _id: '1', name: 'Math' } }] }
      const role = 'tutor'
      const userId = '123'

      jest.spyOn(userService, '_updateMainSubjects').mockResolvedValue({
        tutor: [{ _id: '1', category: { _id: '1', name: 'Math' } }]
      })

      const result = await userService._updateMainSubjects(mainSubject, userSubjects, role, userId)

      expect(result.tutor).toHaveLength(1)
      expect(result.tutor[0]._id).toBe('1')
      expect(result.tutor[0].category._id).toBe('1')
      expect(result.tutor[0].category.name).toBe('Math')
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

      expect(userService._updateMainSubjects).toHaveBeenCalledWith(updateData.mainSubjects, userMock.mainSubjects, role)
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
      const role = 'tutor'
      const updateData = {}

      jest.spyOn(User, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(userService.updateUser(id, role, updateData)).rejects.toThrow(DOCUMENT_NOT_FOUND([User.modelName]))
    })
  })
})

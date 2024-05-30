const userService = require('~/services/user')
const offerService = require('~/services/offer')
const cooperationService = require('~/services/cooperation')
const { FORBIDDEN } = require('~/consts/errors')
const {
  enums: { OFFER_STATUS_ENUM }
} = require('~/consts/validation')

describe('User service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  describe('_updateMainSubjects', () => {
    it('should update main subjects correctly', async () => {
      const mainSubject = { _id: '1', category: { name: 'Math' } }
      const userSubjects = { tutor: [{ _id: '2', category: { name: 'Physics' } }] }
      const role = 'tutor'
      const userId = '123'

      const result = await userService._updateMainSubjects(mainSubject, userSubjects, role, userId)

      expect(result.tutor).toContainEqual(mainSubject)
    })

    it('should throw FORBIDDEN if deletion is blocked', async () => {
      const mainSubject = { _id: '1', category: { name: '' } }
      const userSubjects = { tutor: [{ _id: '1', category: { name: 'Math' } }] }
      const role = 'tutor'
      const userId = '123'

      jest.spyOn(userService, '_calculateDeletionMainSubject').mockResolvedValue(true)

      await expect(userService._updateMainSubjects(mainSubject, userSubjects, role, userId)).rejects.toThrow(FORBIDDEN)
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
})

const { setupTestServer, stopServer } = require('~/test/setupSafeTest')

const Cooperation = require('~/models/cooperation')
const Offer = require('~/models/offer')
const User = require('~/models/user')

const {
  PROFICIENCY_LEVEL_ENUM,
  COOPERATION_STATUS_ENUM,
  NEED_ACTION_ENUM,
  MAIN_ROLE_ENUM,
  RESOURCE_AVAILABILITY_STATUS_ENUM,
  RESOURCES_TYPES_ENUM,
  RESOURCE_COMPLETION_STATUS_ENUM
} = require('~/consts/validation').enums

const cooperationFields = [
  '_id',
  'offer',
  'initiator',
  'initiatorRole',
  'receiver',
  'receiverRole',
  'title',
  'proficiencyLevel',
  'price',
  'status',
  'needAction',
  'needAction.role',
  'needAction.type',
  'needAction.messages',
  'createdAt',
  'updatedAt',
  'sections',
  'availableQuizzes',
  'finishedQuizzes',
  'additionalInfo'
]

describe('Category model', () => {
  let server
  let cooperations

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server

    cooperations = await Cooperation.find({})
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should have all required fields', () => {
    for (const cooperation of cooperations) {
      cooperationFields.forEach((field) => {
        expect(cooperation).toHaveProperty(field)
      })
    }
  })

  it('should have valid fields data types', () => {
    for (const cooperation of cooperations) {
      expect(typeof cooperation.offer).toBe('object')
      expect(typeof cooperation.initiator).toBe('object')
      expect(typeof cooperation.initiatorRole).toBe('string')
      expect(typeof cooperation.receiver).toBe('object')
      expect(typeof cooperation.receiverRole).toBe('string')
      expect(typeof cooperation.title).toBe('string')
      if (cooperation.proficiencyLevel) {
        expect(typeof cooperation.proficiencyLevel).toBe('string')
      }
      expect(typeof cooperation.price).toBe('number')
      expect(typeof cooperation.status).toBe('string')
      expect(typeof cooperation.needAction).toBe('object')
      expect(typeof cooperation.needAction.role).toBe('string')
      expect(typeof cooperation.needAction.type).toBe('string')
      expect(Array.isArray(cooperation.needAction.messages)).toBe(true)
      expect(cooperation.createdAt).toBeInstanceOf(Date)
      expect(cooperation.updatedAt).toBeInstanceOf(Date)
      expect(Array.isArray(cooperation.sections)).toBe(true)
      expect(Array.isArray(cooperation.availableQuizzes)).toBe(true)
      expect(Array.isArray(cooperation.finishedQuizzes)).toBe(true)
      if (cooperation.additionalInfo) {
        expect(typeof cooperation.additionalInfo).toBe('string')
      }
      if (cooperation.sections) {
        expect(Array.isArray(cooperation.sections)).toBe(true)
      }
    }
  })

  it('should have valid references', async () => {
    const cooperationsWithOffers = await Cooperation.find({}).populate('offer')

    for (const cooperation of cooperationsWithOffers) {
      expect(cooperation.offer).not.toBeNull()
      expect(cooperation.offer).toBeInstanceOf(Offer)
    }

    const cooperationsWithUsers = await Cooperation.find({}).populate('initiator').populate('receiver')

    for (const cooperation of cooperationsWithUsers) {
      expect(cooperation.initiator).toBeInstanceOf(User)
      expect(cooperation.receiver).toBeInstanceOf(User)
    }
  })

  it('should validate length constraints of title field', () => {
    for (const cooperation of cooperations) {
      expect(cooperation.title.length).toBeGreaterThanOrEqual(1)
      expect(cooperation.title.length).toBeLessThanOrEqual(100)
    }
  })

  it('should validate length constraints of additionalInfo field', () => {
    for (const cooperation of cooperations) {
      if (cooperation.additionalInfo) {
        expect(cooperation.additionalInfo.length).toBeGreaterThanOrEqual(30)
        expect(cooperation.additionalInfo.length).toBeLessThanOrEqual(1000)
      }
    }
  })

  it('should validate value of price field', () => {
    for (const cooperation of cooperations) {
      expect(cooperation.price).toBeGreaterThanOrEqual(1)
    }
  })

  it('should validate the structure and constraints of sections and their resources', () => {
    for (const cooperation of cooperations) {
      if (cooperation.sections.length < 0) continue
      for (const section of cooperation.sections) {
        expect(section.title.length).toBeGreaterThanOrEqual(1)
        expect(section.title.length).toBeLessThanOrEqual(100)
        expect(section.description.length).toBeGreaterThanOrEqual(1)
        expect(section.description.length).toBeLessThanOrEqual(1000)

        expect(Array.isArray(section.resources)).toBe(true)

        if (section.resources.length < 0) continue
        for (const resource of section.resources) {
          expect(typeof resource.resource).toBe('object')
          expect(typeof resource.resourceType).toBe('string')
          expect(typeof resource.availability).toBe('object')
          expect(typeof resource.availability.status).toBe('string')
          if (resource.availability.date) {
            expect(resource.availability.date).toBeInstanceOf(Date)
          }
          expect(typeof resource.completionStatus).toBe('string')
        }
      }
    }
  })

  it('verifies the type of available quizzes', () => {
    for (const cooperation of cooperations) {
      if (cooperation.availableQuizzes.length < 1) continue
      for (const quiz of cooperation.availableQuizzes) {
        expect(typeof quiz).toBe('object')
      }
    }
  })
  it('verifies the type of finished quizzes', () => {
    for (const cooperation of cooperations) {
      if (cooperation.finishedQuizzes.length < 1) continue
      for (const quiz of cooperation.finishedQuizzes) {
        expect(typeof quiz).toBe('object')
      }
    }
  })

  it('should validate proficiencyLevel field', () => {
    for (const cooperation of cooperations) {
      if (cooperation.proficiencyLevel) {
        const proficiencyLevel = cooperation.proficiencyLevel
        expect(PROFICIENCY_LEVEL_ENUM).toContain(proficiencyLevel)
      }
    }
  })
  it('should validate proficiencyLevel field', () => {
    for (const cooperation of cooperations) {
      if (cooperation.proficiencyLevel) {
        const proficiencyLevel = cooperation.proficiencyLevel
        expect(PROFICIENCY_LEVEL_ENUM).toContain(proficiencyLevel)
      }
    }
  })

  it('should validate status field', () => {
    for (const cooperation of cooperations) {
      const status = cooperation.status
      expect(COOPERATION_STATUS_ENUM).toContain(status)
    }
  })

  it('should validate needAction field', () => {
    for (const cooperation of cooperations) {
      const needAction = cooperation.needAction
      expect(MAIN_ROLE_ENUM).toContain(needAction.role)
      expect(NEED_ACTION_ENUM).toContain(needAction.type)
    }
  })

  it('should validate receiverRole and initiatorRole field', () => {
    for (const cooperation of cooperations) {
      const receiveRole = cooperation.receiverRole
      const initiatorRole = cooperation.initiatorRole
      expect(MAIN_ROLE_ENUM).toContain(receiveRole)
      expect(MAIN_ROLE_ENUM).toContain(initiatorRole)
    }
  })

  xtest('resources', () => {
    //comment in after fixing incorrect spelling of resourceType in db
    for (const cooperation of cooperations) {
      for (const section of cooperation.sections) {
        for (const resource of section.resources) {
          const resourceAvailabilityStatus = resource.availability.status
          expect(RESOURCE_AVAILABILITY_STATUS_ENUM).toContain(resourceAvailabilityStatus)

          const resourceType = resource.resourceType
          expect(RESOURCES_TYPES_ENUM).toContain(resourceType)

          const resourceCompletionStatus = resource.completionStatus
          expect(RESOURCE_COMPLETION_STATUS_ENUM).toContain(resourceCompletionStatus)
        }
      }
    }
  })
})

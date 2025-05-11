const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const User = require('~/models/user')
const {
  enums: { SPOKEN_LANG_ENUM, STATUS_ENUM, ROLE_ENUM }
} = require('~/consts/validation')

const userFields = [
  '_id',
  'role',
  'firstName',
  'lastName',
  'email',
  'address',
  'photo',
  'professionalSummary',
  'mainSubjects',
  'totalReviews',
  'averageRating',
  'nativeLanguage',
  'lastLogin',
  'lastSeen',
  'status',
  'FAQ',
  'videoLink',
  'professionalBlock',
  'aboutStudent',
  'notificationSettings',
  'createdAt',
  'updatedAt'
]

describe('User model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should have all required fields', async () => {
    const users = await User.find({})
    for (const user of users) {
      userFields.forEach((field) => {
        expect(user).toHaveProperty(field)
      })
    }
  })

  it('should have valid fields data types', async () => {
    const users = await User.find({})
    for (const user of users) {
      expect(Array.isArray(user.role)).toBe(true)
      expect(typeof user.firstName).toBe('string')
      expect(typeof user.lastName).toBe('string')
      expect(typeof user.email).toBe('string')

      if (user.address) {
        expect(typeof user.address).toBe('object')
        if (user.address.country) expect(typeof user.address.country).toBe('string')
        if (user.address.city) expect(typeof user.address.city).toBe('string')
      }

      if (user.photo) expect(typeof user.photo).toBe('string')
      if (user.professionalSummary) expect(typeof user.professionalSummary).toBe('string')

      expect(typeof user.mainSubjects).toBe('object')
      expect(typeof user.totalReviews).toBe('object')
      expect(typeof user.totalReviews.student).toBe('number')
      expect(typeof user.totalReviews.tutor).toBe('number')

      expect(typeof user.averageRating).toBe('object')
      expect(typeof user.averageRating.student).toBe('number')
      expect(typeof user.averageRating.tutor).toBe('number')

      if (user.nativeLanguage) expect(typeof user.nativeLanguage).toBe('string')

      if (user.lastLogin) expect(user.lastLogin).toBeInstanceOf(Date)
      if (user.lastSeen) expect(user.lastSeen).toBeInstanceOf(Date)

      expect(typeof user.status).toBe('object')
      expect(typeof user.status.student).toBe('string')
      expect(typeof user.status.tutor).toBe('string')
      expect(typeof user.status.admin).toBe('string')

      expect(typeof user.FAQ).toBe('object')
      expect(typeof user.videoLink).toBe('object')
      expect(typeof user.professionalBlock).toBe('object')
      expect(typeof user.aboutStudent).toBe('object')
      expect(typeof user.notificationSettings).toBe('object')

      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    }
  })

  it('should have unique email', async () => {
    const users = await User.find({})
    const emails = users.map((user) => user.email)
    const uniqueEmails = new Set(emails)

    expect(emails.length).toBe(uniqueEmails.size)
  })

  it('should have valid role values', async () => {
    const users = await User.find({})
    for (const user of users) {
      user.role.forEach((role) => {
        expect(ROLE_ENUM).toContain(role)
      })
    }
  })

  it('should have valid status values', async () => {
    const users = await User.find({})
    for (const user of users) {
      expect(STATUS_ENUM).toContain(user.status.student)
      expect(STATUS_ENUM).toContain(user.status.tutor)
      expect(STATUS_ENUM).toContain(user.status.admin)
    }
  })

  it('should have valid native language if set', async () => {
    const users = await User.find({})
    for (const user of users) {
      if (user.nativeLanguage !== null) {
        expect([...SPOKEN_LANG_ENUM, null]).toContain(user.nativeLanguage)
      }
    }
  })

  it('should have ratings between 0 and 5', async () => {
    const users = await User.find({})
    for (const user of users) {
      expect(user.averageRating.student).toBeGreaterThanOrEqual(0)
      expect(user.averageRating.student).toBeLessThanOrEqual(5)
      expect(user.averageRating.tutor).toBeGreaterThanOrEqual(0)
      expect(user.averageRating.tutor).toBeLessThanOrEqual(5)
    }
  })

  it('should have non-null required fields', async () => {
    const users = await User.find({})
    for (const user of users) {
      expect(user.role).not.toBeNull()
      expect(user.firstName).not.toBeNull()
      expect(user.lastName).not.toBeNull()
      expect(user.email).not.toBeNull()
      expect(user.status).not.toBeNull()
    }
  })

  it('should validate email format', async () => {
    const users = await User.find({})
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    for (const user of users) {
      expect(emailRegex.test(user.email)).toBe(true)
    }
  })

  it('should validate first name and last name length', async () => {
    const users = await User.find({})
    for (const user of users) {
      expect(user.firstName.length).toBeGreaterThanOrEqual(1)
      expect(user.firstName.length).toBeLessThanOrEqual(30)
      expect(user.lastName.length).toBeGreaterThanOrEqual(1)
      expect(user.lastName.length).toBeLessThanOrEqual(30)
    }
  })

  it('should validate professional block field lengths if present', async () => {
    const users = await User.find({})
    for (const user of users) {
      if (user.professionalBlock) {
        if (user.professionalBlock.awards) {
          expect(user.professionalBlock.awards.length).toBeLessThanOrEqual(1000)
        }
        if (user.professionalBlock.scientificActivities) {
          expect(user.professionalBlock.scientificActivities.length).toBeLessThanOrEqual(1000)
        }
        if (user.professionalBlock.workExperience) {
          expect(user.professionalBlock.workExperience.length).toBeLessThanOrEqual(1000)
        }
        if (user.professionalBlock.education) {
          expect(user.professionalBlock.education.length).toBeLessThanOrEqual(1000)
        }
      }
    }
  })

  it('should validate about student field lengths if present', async () => {
    const users = await User.find({})
    for (const user of users) {
      if (user.aboutStudent) {
        if (user.aboutStudent.personalIntroduction) {
          expect(user.aboutStudent.personalIntroduction.length).toBeLessThanOrEqual(1000)
        }
        if (user.aboutStudent.learningGoals) {
          expect(user.aboutStudent.learningGoals.length).toBeLessThanOrEqual(1000)
        }
        if (user.aboutStudent.learningActivities) {
          expect(user.aboutStudent.learningActivities.length).toBeLessThanOrEqual(1000)
        }
      }
    }
  })

  it('should validate FAQ question and answer content if present', async () => {
    const users = await User.find({})
    for (const user of users) {
      if (user.FAQ) {
        if (user.FAQ.student && user.FAQ.student.length > 0) {
          for (const faqItem of user.FAQ.student) {
            expect(faqItem).toHaveProperty('question')
            expect(faqItem).toHaveProperty('answer')
            expect(faqItem.question.trim().length).toBeGreaterThan(0)
            expect(faqItem.answer.trim().length).toBeGreaterThan(0)
          }
        }
        if (user.FAQ.tutor && user.FAQ.tutor.length > 0) {
          for (const faqItem of user.FAQ.tutor) {
            expect(faqItem).toHaveProperty('question')
            expect(faqItem).toHaveProperty('answer')
            expect(faqItem.question.trim().length).toBeGreaterThan(0)
            expect(faqItem.answer.trim().length).toBeGreaterThan(0)
          }
        }
      }
    }
  })

  it('should validate timestamps exist and are correct', async () => {
    const users = await User.find({})
    for (const user of users) {
      expect(user).toHaveProperty('createdAt')
      expect(user).toHaveProperty('updatedAt')
      expect(new Date(user.createdAt).getTime()).toBeLessThanOrEqual(Date.now())
      expect(new Date(user.updatedAt).getTime()).toBeLessThanOrEqual(Date.now())
    }
  })
})

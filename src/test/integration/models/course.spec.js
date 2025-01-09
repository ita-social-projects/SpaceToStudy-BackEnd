const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Course = require('~/models/course')
const User = require('~/models/user')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const { PROFICIENCY_LEVEL_ENUM, RESOURCES_TYPES_ENUM } = require('~/consts/validation').enums

describe('Course model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should include all required fields', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      expect(course).toHaveProperty('title')
      expect(course).toHaveProperty('description')
      expect(course).toHaveProperty('author')
      expect(course).toHaveProperty('subject')
      expect(course).toHaveProperty('proficiencyLevel')
      expect(course).toHaveProperty('createdAt')
      expect(course).toHaveProperty('updatedAt')
    }
  })
  it('should have valid fields data types', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      expect(typeof course.title).toBe('string')
      expect(typeof course.description).toBe('string')
      expect(typeof course.author).toBe('object')
      expect(typeof course.category).toBe('object')
      expect(typeof course.subject).toBe('object')
      expect(Array.isArray(course.proficiencyLevel)).toBe(true)
      expect(course.proficiencyLevel.every((level) => typeof level === 'string')).toBe(true)
      expect(typeof course.sections[0].title).toBe('string')
      expect(typeof course.sections[0].description).toBe('string')
      expect(typeof course.sections[0].resources).toBe('object')
      expect(course.createdAt).toBeInstanceOf(Date)
      expect(course.updatedAt).toBeInstanceOf(Date)
    }
  })
  it('should not allow empty title or description', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      expect(course.title).not.toBeNull()
      expect(course.title.trim()).not.toEqual('')

      expect(course.description).not.toBeNull()
      expect(course.description.trim()).not.toEqual('')
    }
  })
  it('should validate length constraints of title and description', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      if (course.title) {
        expect(course.title.length).toBeGreaterThanOrEqual(1)
        expect(course.title.length).toBeLessThanOrEqual(100)
      }
      if (course.description) {
        expect(course.description.length).toBeGreaterThanOrEqual(1)
        expect(course.description.length).toBeLessThanOrEqual(1000)
      }
    }
  })
  it('should not allow empty author field and have valid User references', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      expect(course.author).not.toBeNull()

      const user = await User.findById(course.author)
      expect(user).not.toBeNull()
      expect(user).toBeInstanceOf(User)
    }
  })
  it('should not allow empty subject field and have valid Subject references', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      expect(course.subject).not.toBeNull()

      const subject = await Subject.findById(course.subject)
      if (subject == !null) {
        expect(subject).toBeInstanceOf(Subject)
      }
    }
  })
  it('should allow category field to be null and have valid Category references', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      if (course.category === null) {
        expect(course.category).toBeNull()
      } else {
        const category = await Category.findById(course.category)
        expect(category).not.toBeNull()
        expect(category).toBeInstanceOf(Category)
      }
    }
  })
  it('should validate proficiencyLevel field', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      expect(course.proficiencyLevel).not.toBeNull()
      expect(course.proficiencyLevel).not.toEqual([])
      expect(course.proficiencyLevel.length).toBeGreaterThan(0)

      course.proficiencyLevel.forEach((level) => {
        expect(typeof level).toBe('string')
      })

      course.proficiencyLevel.forEach((level) => {
        expect(PROFICIENCY_LEVEL_ENUM).toContain(level)
      })
    }
  })
  it('should validate title field in sections and not allow to be empty', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      course.sections.forEach((section) => {
        expect(section.title).not.toBeNull()
        expect(section.title.length).toBeGreaterThanOrEqual(1)
        expect(section.title.length).toBeLessThanOrEqual(100)
      })
    }
  })
  it('should validate description field in sections', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      course.sections.forEach((section) => {
        if (section.description) {
          expect(section.description.length).toBeGreaterThanOrEqual(1)
          expect(section.description.length).toBeLessThanOrEqual(150)
        }
      })
    }
  })
  it('should validate resources field in sections', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      course.sections.forEach((section) => {
        section.resources.forEach((resource) => {
          expect(resource.resource).not.toBeNull()
          expect(resource.resourceType).toBeDefined()
          expect(RESOURCES_TYPES_ENUM).toContain(resource.resourceType)
        })
      })
    }
  })
})

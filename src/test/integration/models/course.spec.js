const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Course = require('~/models/course')
const User = require('~/models/user')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const { PROFICIENCY_LEVEL_ENUM, RESOURCES_TYPES_ENUM } = require('~/consts/validation').enums
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_SHORTER, FIELD_CANNOT_BE_LONGER } = require('~/consts/errors')

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

  it('should not allow empty title', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      expect(course.title).not.toBeNull()
      expect(course.title.trim()).not.toEqual('')
    }
  })

  it('should validate length constraints of title', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      if (course.title) {
        expect(course.title.length).toBeGreaterThanOrEqual(1)
        expect(course.title.length).toBeLessThanOrEqual(100)
      }
    }
  })

  it('should return FIELD_CANNOT_BE_SHORTER and FIELD_CANNOT_BE_LONGER for invalid title length in existing data', async () => {
    const tooShortTitles = await Course.find({
      title: { $exists: true, $regex: '^.{0}$' }
    })
    const tooLongTitles = await Course.find({
      title: { $exists: true, $regex: '^.{101,}$' }
    })

    for (const course of tooShortTitles) {
      const error = course.validateSync().errors['title']
      expect(error.message).toBe(FIELD_CANNOT_BE_SHORTER('title', 1))
    }

    for (const course of tooLongTitles) {
      const error = course.validateSync().errors['title']
      expect(error.message).toBe(FIELD_CANNOT_BE_LONGER('title', 100))
    }
  })

  it('should not allow empty description', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      expect(course.description).not.toBeNull()
      expect(course.description.trim()).not.toEqual('')
    }
  })

  it('should validate length constraints of description', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      if (course.description) {
        expect(course.description.length).toBeGreaterThanOrEqual(1)
        expect(course.description.length).toBeLessThanOrEqual(1000)
      }
    }
  })

  it('should return FIELD_CANNOT_BE_SHORTER and FIELD_CANNOT_BE_LONGER for invalid description length in existing data', async () => {
    const tooShortDescriptions = await Course.find({
      description: { $exists: true, $regex: '^.{0}$' }
    })
    const tooLongDescriptions = await Course.find({
      description: { $exists: true, $regex: '^.{1001,}$' }
    })

    for (const course of tooShortDescriptions) {
      const error = course.validateSync().errors['description']
      expect(error.message).toBe(FIELD_CANNOT_BE_SHORTER('description', 1))
    }

    for (const course of tooLongDescriptions) {
      const error = course.validateSync().errors['description']
      expect(error.message).toBe(FIELD_CANNOT_BE_LONGER('description', 1000))
    }
  })

  it('should not allow empty author field', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      expect(course.author).not.toBeNull()
    }
  })

  it('should return FIELD_CANNOT_BE_EMPTY for missing author field in existing data', async () => {
    const emptyAnswers = await Course.find({ author: null })
    for (const course of emptyAnswers) {
      const error = course.validateSync().errors['author']
      expect(error.message).toBe(FIELD_CANNOT_BE_EMPTY('author'))
    }
  })

  it('should be valid User references in author field', async () => {
    const courses = await Course.find({}).select({ author: true }).populate('author')
    for (const course of courses) {
      if (course.author) {
        expect(course.author).not.toBeNull()
        expect(course.author).toBeInstanceOf(User)
      }
    }
  })

  it('should not allow empty subject field', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      expect(course.subject).not.toBeNull()
    }
  })

  it('should return FIELD_CANNOT_BE_EMPTY for missing subject field in existing data', async () => {
    const emptyAnswers = await Course.find({ subject: null })
    for (const course of emptyAnswers) {
      const error = course.validateSync().errors['subject']
      expect(error.message).toBe(FIELD_CANNOT_BE_EMPTY('subject'))
    }
  })

  it('should be valid Subject references in subject field', async () => {
    const courses = await Course.find({}).select({ subject: true }).populate('subject')
    for (const course of courses) {
      if (course.subject) {
        expect(course.subject).not.toBeNull()
        expect(course.subject).toBeInstanceOf(Subject)
      }
    }
  })

  it('should allow category field to be null and have valid Category references', async () => {
    const courses = await Course.find({}).select({ category: true }).populate('category')

    for (const course of courses) {
      expect(course.category === null || course.category instanceof Category).toBe(true)
    }
  })

  it('should validate proficiencyLevel field', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      expect(course.proficiencyLevel).not.toBeNull()
      expect(course.proficiencyLevel).not.toEqual([])

      course.proficiencyLevel.forEach((level) => {
        expect(typeof level).toBe('string')
        expect(PROFICIENCY_LEVEL_ENUM).toContain(level)
      })
    }
  })

  it('should validate title field in sections is within the allowed range and not allow to be empty', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      course.sections.forEach((section) => {
        expect(section.title).not.toBeNull()
        expect(section.title.length).toBeGreaterThanOrEqual(1)
        expect(section.title.length).toBeLessThanOrEqual(100)
      })
    }
  })

  it('should return FIELD_CANNOT_BE_EMPTY for missing title field in sections in existing data', async () => {
    const emptyAnswers = await Course.find({
      'sections.title': null
    })
    for (const course of emptyAnswers) {
      const error = course.validateSync().errors['sections.0.title']
      expect(error.message).toBe(FIELD_CANNOT_BE_EMPTY('title'))
    }
  })

  it('should return FIELD_CANNOT_BE_SHORTER and FIELD_CANNOT_BE_LONGER for invalid title field in sections length in existing data', async () => {
    const tooShortData = await Course.find({
      'sections.title': { $exists: true, $regex: '^.{0}$' }
    })
    const tooLongData = await Course.find({
      'sections.title': { $exists: true, $regex: '^.{101,}$' }
    })

    for (const course of tooShortData) {
      const error = course.validateSync().errors['sections.0.title']
      expect(error.message).toBe(FIELD_CANNOT_BE_SHORTER('title', 1))
    }

    for (const course of tooLongData) {
      const error = course.validateSync().errors['sections.0.title']
      expect(error.message).toBe(FIELD_CANNOT_BE_LONGER('title', 100))
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

  it('should return FIELD_CANNOT_BE_SHORTER and FIELD_CANNOT_BE_LONGER for invalid description field in sections length in existing data', async () => {
    const courses = await Course.find({})
    const tooShortData = await Course.find({
      'sections.description': { $exists: true, $regex: '^.{0}$' }
    })
    const tooLongData = await Course.find({
      'sections.description': { $exists: true, $regex: '^.{151,}$' }
    })

    for (const course of courses) {
      if (course.sections.description) {
        for (const data of tooShortData) {
          const error = data.validateSync().errors['sections.0.description']
          expect(error.message).toBe(FIELD_CANNOT_BE_SHORTER('description', 1))
        }
        for (const data of tooLongData) {
          const error = data.validateSync().errors['sections.0.description']
          expect(error.message).toBe(FIELD_CANNOT_BE_LONGER('description', 150))
        }
      }
    }
  })

  it('should not allow empty resource in resources field in sections', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      course.sections.forEach((section) => {
        section.resources.forEach((eachResource) => {
          expect(eachResource.resource).not.toBeNull()
        })
      })
    }
  })

  it('should validate resourceType in resources field in sections', async () => {
    const courses = await Course.find({})

    for (const course of courses) {
      course.sections.forEach((section) => {
        section.resources.forEach((resource) => {
          expect(resource.resourceType).not.toBeNull()
          expect(resource.resourceType).toBeDefined()
          expect(RESOURCES_TYPES_ENUM).toContain(resource.resourceType)
        })
      })
    }
  })
})

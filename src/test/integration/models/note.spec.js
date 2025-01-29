const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const Note = require('~/models/note')
const User = require('~/models/user')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_LONGER } = require('~/consts/errors')

describe('Note Model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })
  afterAll(async () => {
    await stopServer(server)
  })

  it('should include all required fields', async () => {
    const notes = await Note.find({})

    for (const note of notes) {
      expect(note).toHaveProperty('text')
      expect(note).toHaveProperty('author')
      expect(note).toHaveProperty('cooperation')
    }
  })
  it('should have valid fields data types', async () => {
    const notes = await Note.find({})

    for (const note of notes) {
      expect(typeof note.text).toBe('string')
      expect(typeof note.author).toBe('object')
      expect(typeof note.isPrivate).toBe('boolean')
      expect(typeof note.cooperation).toBe('object')
      expect(note.createdAt).toBeInstanceOf(Date)
      expect(note.updatedAt).toBeInstanceOf(Date)
    }
  })
  it('should not allow empty text field', async () => {
    const notes = await Note.find({})

    for (const note of notes) {
      expect(note.text).not.toBeNull()
      expect(note.text.trim()).not.toEqual('')
    }
  })
  it('should validate length constraints of text field', async () => {
    const notes = await Note.find({})

    for (const note of notes) {
      if (note.text) {
        expect(note.text.length).toBeGreaterThanOrEqual(1)
        expect(note.text.length).toBeLessThanOrEqual(100)
      }
    }
  })
  it('should not allow empty author field', async () => {
    const notes = await Note.find({})

    for (const note of notes) {
      expect(note.author).not.toBeNull()
    }
  })
  it('should be valid User references in author field', async () => {
    const notes = await Note.find({}).select({ author: true }).populate('author')
    for (const note of notes) {
      if (note.author) {
        expect(note.author).not.toBeNull()
        expect(note.author).toBeInstanceOf(User)
      }
    }
  })
  it('should validate default value of isPrivate field', async () => {
    const notes = await Note.find({})

    for (const note of notes) {
      expect(note.isPrivate).toBeDefined()
      expect(typeof note.isPrivate).toBe('boolean')
    }
  })

  it('should not allow empty cooperation field', async () => {
    const notes = await Note.find({})

    for (const note of notes) {
      expect(note.cooperation).not.toBeNull()
    }
  })

  it('should fail validation for empty required fields when creating a note', async () => {
    const invalidNote = new Note({
      text: '',
      author: null,
      cooperation: null
    })

    const validationError = invalidNote.validateSync()

    expect(validationError.errors.text.message).toBe(FIELD_CANNOT_BE_EMPTY('text'))
    expect(validationError.errors.author.message).toBe(FIELD_CANNOT_BE_EMPTY('author'))
    expect(validationError.errors.cooperation.message).toBe(FIELD_CANNOT_BE_EMPTY('cooperation'))
  })
  it('should enforce maximum length of text field', async () => {
    const invalidText = 'a'.repeat(101)
    const invalidNote = new Note({
      text: invalidText,
      author: 'validAuthorId',
      cooperation: 'validCooperationId'
    })

    const validationError = invalidNote.validateSync()

    expect(validationError.errors.text.message).toBe(FIELD_CANNOT_BE_LONGER('text', 100))
  })
})

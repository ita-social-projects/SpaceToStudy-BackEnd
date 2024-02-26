const deleteNotAllowedFields = require('~/utils/cooperations/sections/deleteNotAllowedFields')

const initialResource = {
  title: 'Title',
  text: 'Text',
  answers: [{ text: 'Answer 1', isCorrect: true }]
}

describe('deleteNotAllowedFields', () => {
  let resource

  beforeEach(() => {
    resource = { ...initialResource, settings: { shuffle: true } }
  })

  it('should delete not allowed fields', () => {
    const allowedFields = ['title', 'text', 'answers']

    expect(resource).toHaveProperty('settings')

    deleteNotAllowedFields(resource, allowedFields)

    expect(resource).toEqual(initialResource)

    expect(resource).not.toHaveProperty('settings')
  })

  it('should not modify resource if all fields are allowed', () => {
    const allowedFields = Object.keys(resource)

    deleteNotAllowedFields(resource, allowedFields)

    expect(resource).toEqual({ ...initialResource, settings: { shuffle: true } })
  })
})

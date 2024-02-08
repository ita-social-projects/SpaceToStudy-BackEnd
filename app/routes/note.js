const router = require('express').Router({ mergeParams: true })

const noteController = require('~/app/controllers/note')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const { authMiddleware } = require('~/app/middlewares/auth')
const isEntityValid = require('~/app/middlewares/entityValidation')
const idValidation = require('~/app/middlewares/idValidation')

const Cooperation = require('~/app/models/cooperation')
const Note = require('~/app/models/note')

const params = [
  { model: Cooperation, idName: 'id' },
  { model: Note, idName: 'noteId' }
]

router.param('id', idValidation)
router.param('noteId', idValidation)
router.use(authMiddleware)

router.post('/', isEntityValid({ params }), asyncWrapper(noteController.addNote))
router.get('/', isEntityValid({ params }), asyncWrapper(noteController.getNotes))
router.patch('/:noteId', isEntityValid({ params }), asyncWrapper(noteController.updateNote))
router.delete('/:noteId', isEntityValid({ params }), asyncWrapper(noteController.deleteNote))

module.exports = router

const router = require('express').Router({ mergeParams: true })

const noteController = require('~/controllers/note')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')
const idValidation = require('~/middlewares/idValidation')

const Cooperation = require('~/models/cooperation')
const Note = require('~/models/note')

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

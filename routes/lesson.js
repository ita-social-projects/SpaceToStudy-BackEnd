const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const idValidation = require('~/middlewares/idValidation')
const isEntityValid = require('~/middlewares/entityValidation')
const lessonController = require('~/controllers/lesson')
const Lesson = require('~/models/lesson')
const Attachment = require('~/models/attachment')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

const body = [{ model: Attachment, idName: 'attachment' }]
const params = [{ model: Lesson, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.use(restrictTo(TUTOR))
router.get('/', asyncWrapper(lessonController.getLessons))
router.post('/', isEntityValid({ body }), asyncWrapper(lessonController.createLesson))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(lessonController.updateLesson))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(lessonController.deleteLesson))
router.get('/:id', isEntityValid({ params }), asyncWrapper(lessonController.getLessonById))

module.exports = router

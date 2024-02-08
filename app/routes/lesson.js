const router = require('express').Router()

const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/app/middlewares/auth')
const idValidation = require('~/app/middlewares/idValidation')
const isEntityValid = require('~/app/middlewares/entityValidation')
const lessonController = require('~/app/controllers/lesson')
const Lesson = require('~/app/models/lesson')
const Attachment = require('~/app/models/attachment')
const {
  roles: { TUTOR }
} = require('~/app/consts/auth')

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

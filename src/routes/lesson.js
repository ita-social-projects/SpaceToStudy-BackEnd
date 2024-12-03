const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo, ownershipMiddleware, availabilityMiddleware } = require('~/middlewares/auth')
const idValidation = require('~/middlewares/idValidation')
const isEntityValid = require('~/middlewares/entityValidation')
const lessonController = require('~/controllers/lesson')
const Lesson = require('~/models/lesson')
const Attachment = require('~/models/attachment')
const {
  MODEL_CONFIGS: { CooperationModel }
} = require('~/consts/modelPath')
const {
  ownerFields,
  roles: { TUTOR }
} = require('~/consts/auth')

const body = [{ model: Attachment, idName: 'attachment' }]
const params = [{ model: Lesson, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(lessonController.getLessons))
router.use('/:id', isEntityValid({ params }), asyncWrapper(ownershipMiddleware(Lesson, ownerFields, CooperationModel)))
router.get(
  '/:id',
  asyncWrapper(availabilityMiddleware(Lesson, CooperationModel)),
  asyncWrapper(lessonController.getLessonById)
)
router.use(restrictTo(TUTOR))
router.post('/', isEntityValid({ body }), asyncWrapper(lessonController.createLesson))
router.patch('/:id', asyncWrapper(lessonController.updateLesson))
router.delete('/:id', asyncWrapper(lessonController.deleteLesson))

module.exports = router

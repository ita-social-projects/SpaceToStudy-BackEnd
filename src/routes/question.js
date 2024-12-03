const router = require('express').Router()

const Question = require('~/models/question')

const questionController = require('~/controllers/question')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const isEntityValid = require('~/middlewares/entityValidation')
const { authMiddleware, restrictTo, ownershipMiddleware, availabilityMiddleware } = require('~/middlewares/auth')
const {
  MODEL_CONFIGS: { CooperationModel }
} = require('~/consts/modelPath')
const {
  ownerFields,
  roles: { TUTOR }
} = require('~/consts/auth')

router.use(authMiddleware)
const params = [{ model: Question, idName: 'id' }]

router.get('/', asyncWrapper(questionController.getQuestions))
router.use(
  '/:id',
  isEntityValid({ params }),
  asyncWrapper(ownershipMiddleware(Question, ownerFields, CooperationModel))
)
router.get(
  '/:id',
  asyncWrapper(availabilityMiddleware(Question, CooperationModel)),
  asyncWrapper(questionController.getQuestionById)
)
router.use(restrictTo(TUTOR))
router.post('/', asyncWrapper(questionController.createQuestion))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(questionController.deleteQuestion))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(questionController.updateQuestion))

module.exports = router

const router = require('express').Router({ mergeParams: true })
const Quiz = require('~/models/quiz')
const quizController = require('~/controllers/quiz')
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

const params = [{ model: Quiz, idName: 'id' }]

router.use(authMiddleware)

router.use('/:id', isEntityValid({ params }), asyncWrapper(ownershipMiddleware(Quiz, ownerFields, CooperationModel)))
router.get(
  '/:id',
  asyncWrapper(quizController.getQuizById),
  asyncWrapper(availabilityMiddleware(Quiz, CooperationModel))
)
router.use(restrictTo(TUTOR))
router.get('/', asyncWrapper(quizController.getQuizzes))
router.post('/', asyncWrapper(quizController.createQuiz))
router.delete('/:id', asyncWrapper(quizController.deleteQuiz))
router.patch('/:id', asyncWrapper(quizController.updateQuiz))

module.exports = router

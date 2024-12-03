const router = require('express').Router({ mergeParams: true })
const Quiz = require('~/models/quiz')
const Cooperation = require('~/models/cooperation')

const {
  ownerFields,
  roles: { TUTOR }
} = require('~/consts/auth')
const quizController = require('~/controllers/quiz')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const isEntityValid = require('~/middlewares/entityValidation')
const { authMiddleware, restrictTo, ownershipMiddleware } = require('~/middlewares/auth')

const params = [{ model: Quiz, idName: 'id' }]

router.use(authMiddleware)

router.use('/:id', isEntityValid({ params }), asyncWrapper(ownershipMiddleware(Quiz, ownerFields, Cooperation)))
router.get('/:id', asyncWrapper(quizController.getQuizById))
router.use(restrictTo(TUTOR))
router.get('/', asyncWrapper(quizController.getQuizzes))
router.post('/', asyncWrapper(quizController.createQuiz))
router.delete('/:id', asyncWrapper(quizController.deleteQuiz))
router.patch('/:id', asyncWrapper(quizController.updateQuiz))

module.exports = router

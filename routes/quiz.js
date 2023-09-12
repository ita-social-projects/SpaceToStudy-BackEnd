const router = require('express').Router({ mergeParams: true })
const Quiz = require('~/models/quiz')

const {
  roles: { TUTOR }
} = require('~/consts/auth')
const quizController = require('~/controllers/quiz')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const isEntityValid = require('~/middlewares/entityValidation')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')

const params = [{ model: Quiz, idName: 'id' }]

router.use(authMiddleware)

router.get('/:id', isEntityValid({ params }), asyncWrapper(quizController.getQuizById))
router.use(restrictTo(TUTOR))
router.get('/', asyncWrapper(quizController.getQuizzes))
router.post('/', asyncWrapper(quizController.createQuiz))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(quizController.updateQuiz))

module.exports = router

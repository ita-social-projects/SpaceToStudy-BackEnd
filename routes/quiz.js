const router = require('express').Router({ mergeParams: true })

const quizController = require('~/controllers/quiz')
const Quiz = require('~/models/quiz')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const {
  roles: { TUTOR }
} = require('~/consts/auth')

const params = [{ model: Quiz, idName: 'id' }]

router.use(authMiddleware)

router.use(restrictTo(TUTOR))
router.get('/', asyncWrapper(quizController.getQuizzes))
router.post('/', asyncWrapper(quizController.createQuiz))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(quizController.deleteQuiz))

module.exports = router

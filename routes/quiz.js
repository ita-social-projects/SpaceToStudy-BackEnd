const router = require('express').Router({ mergeParams: true })

const {
  roles: { TUTOR }
} = require('~/consts/auth')
const quizController = require('~/controllers/quiz')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')

router.use(authMiddleware)

router.use(restrictTo(TUTOR))
router.get('/', asyncWrapper(quizController.getQuizzes))
router.post('/', asyncWrapper(quizController.createQuiz))

module.exports = router

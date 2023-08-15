const router = require('express').Router()

const { authMiddleware } = require('~/middlewares/auth')
const asyncWrapper = require('~/middlewares/asyncWrapper')

const finishedQuizController = require('~/controllers/finishedQuiz')

router.use(authMiddleware)

router.get('/', asyncWrapper(finishedQuizController.getFinishedQuizzes))

module.exports = router

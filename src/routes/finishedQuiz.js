const router = require('express').Router()

const { authMiddleware } = require('~/middlewares/auth')
const asyncWrapper = require('~/middlewares/asyncWrapper')

const isEntityValid = require('~/middlewares/entityValidation')
const finishedQuizController = require('~/controllers/finishedQuiz')
const Quiz = require('~/models/quiz')

const body = [{ model: Quiz, idName: 'quiz' }]

router.use(authMiddleware)

router.get('/', asyncWrapper(finishedQuizController.getFinishedQuizzes))
router.post('/', isEntityValid({ body }), asyncWrapper(finishedQuizController.createFinishedQuiz))

module.exports = router
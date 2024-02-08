const router = require('express').Router()

const { authMiddleware } = require('~/app/middlewares/auth')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')

const isEntityValid = require('~/app/middlewares/entityValidation')
const finishedQuizController = require('~/app/controllers/finishedQuiz')
const Quiz = require('~/app/models/quiz')

const body = [{ model: Quiz, idName: 'quiz' }]

router.use(authMiddleware)

router.get('/', asyncWrapper(finishedQuizController.getFinishedQuizzes))
router.post('/', isEntityValid({ body }), asyncWrapper(finishedQuizController.createFinishedQuiz))

module.exports = router

const router = require('express').Router()

const { authMiddleware, ownershipMiddleware } = require('~/middlewares/auth')
const asyncWrapper = require('~/middlewares/asyncWrapper')

const isEntityValid = require('~/middlewares/entityValidation')
const finishedQuizController = require('~/controllers/finishedQuiz')
const Quiz = require('~/models/quiz')
const FinishedQuiz = require('~/models/finishedQuiz')
const idValidation = require('~/middlewares/idValidation')
const { ownerFields } = require('~/consts/auth')

const body = [{ model: Quiz, idName: 'quiz' }]
const params = [{ model: FinishedQuiz, idName: 'id' }]

router.use(authMiddleware)
router.param('id', idValidation)
router.use('/by-quiz/:id', isEntityValid({ params }), asyncWrapper(ownershipMiddleware(FinishedQuiz, ownerFields)))

router.get('/', asyncWrapper(finishedQuizController.getFinishedQuizzes))
router.get('/:id', asyncWrapper(finishedQuizController.getFinishedQuizById))
router.get('/by-quiz-id/:id', asyncWrapper(finishedQuizController.getFinishedQuizByQuizId))
router.post('/', isEntityValid({ body }), asyncWrapper(finishedQuizController.createFinishedQuiz))
router.patch('/:id', asyncWrapper(finishedQuizController.updateFinishedQuiz))

module.exports = router

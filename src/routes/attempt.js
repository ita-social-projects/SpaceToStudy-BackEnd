const router = require('express').Router()

const { authMiddleware } = require('~/middlewares/auth')
const asyncWrapper = require('~/middlewares/asyncWrapper')

const isEntityValid = require('~/middlewares/entityValidation')
const attemptController = require('~/controllers/attempt')
const Quiz = require('~/models/quiz')
const idValidation = require('~/middlewares/idValidation')

const body = [{ model: Quiz, idName: 'quiz' }]

router.use(authMiddleware)
router.param('id', idValidation)

router.get('/', asyncWrapper(attemptController.getAttempts))
router.get('/:id', asyncWrapper(attemptController.getAttemptById))
router.get('/:cooperationId/:quizId', asyncWrapper(attemptController.getAttemptByQuizId))
router.post('/', isEntityValid({ body }), asyncWrapper(attemptController.createAttempt))
router.patch('/:id', asyncWrapper(attemptController.updateAttempt))

module.exports = router

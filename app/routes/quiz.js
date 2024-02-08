const router = require('express').Router({ mergeParams: true })
const Quiz = require('~/app/models/quiz')

const {
  roles: { TUTOR }
} = require('~/app/consts/auth')
const quizController = require('~/app/controllers/quiz')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const isEntityValid = require('~/app/middlewares/entityValidation')
const { authMiddleware, restrictTo } = require('~/app/middlewares/auth')

const params = [{ model: Quiz, idName: 'id' }]


router.use(authMiddleware)

router.get('/:id', isEntityValid({ params }), asyncWrapper(quizController.getQuizById))
router.use(restrictTo(TUTOR))
router.get('/', asyncWrapper(quizController.getQuizzes))
router.post('/', asyncWrapper(quizController.createQuiz))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(quizController.deleteQuiz))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(quizController.updateQuiz))

module.exports = router

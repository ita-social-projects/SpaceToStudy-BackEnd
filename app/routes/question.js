const router = require('express').Router()

const Question = require('~/app/models/question')

const questionController = require('~/app/controllers/question')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const isEntityValid = require('~/app/middlewares/entityValidation')
const { authMiddleware, restrictTo } = require('~/app/middlewares/auth')

const {
  roles: { TUTOR }
} = require('~/app/consts/auth')

router.use(authMiddleware)
const params = [{ model: Question, idName: 'id' }]

router.get('/', asyncWrapper(questionController.getQuestions))
router.get('/:id', isEntityValid({ params }), asyncWrapper(questionController.getQuestionById))
router.use(restrictTo(TUTOR))
router.post('/', asyncWrapper(questionController.createQuestion))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(questionController.deleteQuestion))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(questionController.updateQuestion))

module.exports = router

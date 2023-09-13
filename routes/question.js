const router = require('express').Router()
const questionController = require('~/controllers/question')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const {
  roles: { TUTOR }
} = require('~/consts/auth')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const Question = require('~/models/question')

const params = [{ model: Question, idName: 'id' }]

router.use(authMiddleware)

router.get('/', asyncWrapper(questionController.getQuestions))
router.use(restrictTo(TUTOR))
router.post('/', asyncWrapper(questionController.createQuestion))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(questionController.deleteQuestion))

module.exports = router

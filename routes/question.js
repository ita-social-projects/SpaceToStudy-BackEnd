const router = require('express').Router()
const Question = require('~/models/question')

const questionController = require('~/controllers/question')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo, isEntityValid } = require('~/middlewares/auth')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

router.use(authMiddleware)
const params = [{ model: Question, idName: 'id' }]

router.get('/', asyncWrapper(questionController.getQuestions))
router.use(restrictTo(TUTOR))
router.post('/', asyncWrapper(questionController.createQuestion))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(questionController.updateQuestion))

module.exports = router

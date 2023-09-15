const router = require('express').Router()

const questionController = require('~/controllers/question')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

router.use(authMiddleware)

router.get('/', asyncWrapper(questionController.getQuestions))
router.use(restrictTo(TUTOR))
router.post('/', asyncWrapper(questionController.createQuestion))

module.exports = router

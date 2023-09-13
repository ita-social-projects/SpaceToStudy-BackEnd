const router = require('express').Router()

const questionController = require('~/controllers/question')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')

router.use(authMiddleware)

router.get('/', asyncWrapper(questionController.getQuestions))

module.exports = router

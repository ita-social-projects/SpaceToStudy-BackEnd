const router = require('express').Router()

const questionController = require('~/controllers/question')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')
const Question = require('~/models/question')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

const body = [{ model: Question, idName: 'question' }]

router.use(authMiddleware)

router.use(restrictTo(TUTOR))
router.post('/', isEntityValid({ body }), asyncWrapper(questionController.createQuestion))

module.exports = router

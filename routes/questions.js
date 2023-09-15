const router = require('express').Router()
const Question = require('~/models/question')

const questionController = require('~/controllers/question')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const isEntityValid = require('~/middlewares/entityValidation')

const { authMiddleware } = require('~/middlewares/auth')

router.use(authMiddleware)

const params = [{ model: Question, idName: 'id' }]

router.patch('/:id', isEntityValid({ params }), asyncWrapper(questionController.updateQuestion))

module.exports = router

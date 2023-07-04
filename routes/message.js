const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const messageController = require('~/controllers/message')
const Message = require('~/models/message')

const body = [{ model: Message, idName: 'message' }]

router.use(authMiddleware)

router.post('/', isEntityValid({ body }), asyncWrapper(messageController.sendMessage))

module.exports = router

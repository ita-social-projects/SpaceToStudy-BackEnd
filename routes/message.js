const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const messageController = require('~/controllers/message')
const Chat = require('~/models/chat')

const body = [{ model: Chat, idName: 'chat' }]

router.use(authMiddleware)

router.post('/', isEntityValid({ body }), asyncWrapper(messageController.sendMessage))

module.exports = router

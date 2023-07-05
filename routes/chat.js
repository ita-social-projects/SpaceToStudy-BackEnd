const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const messageRouter = require('~/routes/message')

const chatController = require('~/controllers/chat')
const User = require('~/models/user')

const body = [{ model: User, idName: 'user' }]

router.use(authMiddleware)

router.use('/:id/messages', messageRouter)

router.post('/', isEntityValid({ body }), asyncWrapper(chatController.createChat))
router.get('/', asyncWrapper(chatController.getChats))

module.exports = router

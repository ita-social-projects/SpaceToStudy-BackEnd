const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const messageRouter = require('~/routes/message')

const chatController = require('~/controllers/chat')
const User = require('~/models/user')
const Chat = require('~/models/chat')

const body = [{ model: User, idName: 'user' }]
const params = [{ model: Chat, idName: 'id' }]

router.use(authMiddleware)

router.use('/:id/messages', messageRouter)

router.post('/', isEntityValid({ body }), asyncWrapper(chatController.createChat))
router.get('/', asyncWrapper(chatController.getChats))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(chatController.deleteChat))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(chatController.markAsDeletedForCurrentUser))

module.exports = router

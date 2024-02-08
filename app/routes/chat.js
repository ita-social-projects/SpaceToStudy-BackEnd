const router = require('express').Router()

const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const { authMiddleware } = require('~/app/middlewares/auth')
const isEntityValid = require('~/app/middlewares/entityValidation')

const messageRouter = require('~/app/routes/message')

const chatController = require('~/app/controllers/chat')
const User = require('~/app/models/user')
const Chat = require('~/app/models/chat')

const body = [{ model: User, idName: 'user' }]
const params = [{ model: Chat, idName: 'id' }]

router.use(authMiddleware)

router.use('/:id/messages', messageRouter)

router.post('/', isEntityValid({ body }), asyncWrapper(chatController.createChat))
router.get('/', asyncWrapper(chatController.getChats))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(chatController.deleteChat))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(chatController.markAsDeletedForCurrentUser))

module.exports = router

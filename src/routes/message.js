const router = require('express').Router({ mergeParams: true })

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const messageController = require('~/controllers/message')
const Chat = require('~/models/chat')

const params = [{ model: Chat, idName: 'id' }]

router.use(authMiddleware)

router.get('/', isEntityValid({ params }), asyncWrapper(messageController.getMessages))
router.post('/', asyncWrapper(messageController.sendMessage))
router.delete('/', isEntityValid({ params }), asyncWrapper(messageController.deleteMessages))
router.patch('/', isEntityValid({ params }), asyncWrapper(messageController.clearHistory))

module.exports = router

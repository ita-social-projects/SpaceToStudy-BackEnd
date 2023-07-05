const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const chatController = require('~/controllers/chat')
const User = require('~/models/user')

const body = [{ model: User, idName: 'targetUserId' }]

router.use(authMiddleware)

router.post('/', isEntityValid({ body }), asyncWrapper(chatController.createChat))

module.exports = router

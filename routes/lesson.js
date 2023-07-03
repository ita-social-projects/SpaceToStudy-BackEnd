const router = require('express').Router()

const lessonController = require('~/controllers/lesson')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')

router.use(authMiddleware)

router.post('/', asyncWrapper(lessonController.createLesson))

module.exports = router

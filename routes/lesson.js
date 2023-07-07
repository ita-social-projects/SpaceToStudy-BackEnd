const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')

const lessonController = require('~/controllers/lesson')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

router.use(authMiddleware)

router.use(restrictTo(TUTOR))
router.post('/', asyncWrapper(lessonController.createLesson))

module.exports = router

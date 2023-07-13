const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const lessonController = require('~/controllers/lesson')
const Lesson = require('~/models/lesson')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

const params = [{ model: Lesson, idName: 'id' }]

router.use(authMiddleware)

router.use(restrictTo(TUTOR))
router.post('/', asyncWrapper(lessonController.createLesson))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(lessonController.deleteLesson))

module.exports = router

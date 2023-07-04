const router = require('express').Router()

const { roles: { TUTOR} } = require('~/consts/auth')
const courseController = require('~/controllers/course')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')

router.use(authMiddleware)

router.use(restrictTo(TUTOR))
router.patch('/:id', asyncWrapper(courseController.updateCourse))

module.exports = router

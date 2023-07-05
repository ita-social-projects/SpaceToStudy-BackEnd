const router = require('express').Router()

const { roles: { TUTOR} } = require('~/consts/auth')
const courseController = require('~/controllers/course')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')
const idValidation = require('~/middlewares/idValidation')
const Course = require('~/models/course')

const params = [{ model: Course, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.use(restrictTo(TUTOR))
router.patch('/:id', isEntityValid({ params }),asyncWrapper(courseController.updateCourse))

module.exports = router

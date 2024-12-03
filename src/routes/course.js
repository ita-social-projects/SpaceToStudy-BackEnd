const router = require('express').Router()

const courseController = require('~/controllers/course')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')
const idValidation = require('~/middlewares/idValidation')
const Course = require('~/models/course')
const Lesson = require('~/models/lesson')

const Attachment = require('~/models/attachment')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

const body = [
  { model: Lesson, idName: 'lessons' },
  { model: Attachment, idName: 'attachment' }
]
const params = [{ model: Course, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)
router.use('/:id', isEntityValid({ params }))

router.get('/:id', asyncWrapper(courseController.getCourseById))
router.use(restrictTo(TUTOR))
router.get('/', asyncWrapper(courseController.getCourses))
router.post('/', isEntityValid({ body }), asyncWrapper(courseController.createCourse))
router.patch('/:id', asyncWrapper(courseController.updateCourse))
router.delete('/:id', asyncWrapper(courseController.deleteCourse))

module.exports = router

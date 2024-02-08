const router = require('express').Router()

const courseController = require('~/app/controllers/course')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/app/middlewares/auth')
const isEntityValid = require('~/app/middlewares/entityValidation')
const idValidation = require('~/app/middlewares/idValidation')
const Course = require('~/app/models/course')
const Lesson = require('~/app/models/lesson')
const Attachment = require('~/app/models/attachment')
const {
  roles: { TUTOR }
} = require('~/app/consts/auth')

const body = [
  { model: Lesson, idName: 'lessons' },
  { model: Attachment, idName: 'attachment' }
]
const params = [{ model: Course, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/:id', isEntityValid({ params }), asyncWrapper(courseController.getCourseById))
router.use(restrictTo(TUTOR))
router.get('/', asyncWrapper(courseController.getCourses))
router.post('/', isEntityValid({ body }), asyncWrapper(courseController.createCourse))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(courseController.updateCourse))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(courseController.deleteCourse))

module.exports = router

const router = require('express').Router()

const coursesAndCooperationsController = require('~/controllers/coursesCooperations')
const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

router.use(authMiddleware)

router.param('resourceId', idValidation)

router.use(restrictTo(TUTOR))
router.get(
  '/resource/:resourceId',
  asyncWrapper(coursesAndCooperationsController.getCoursesAndCooperationsByResourseId)
)

module.exports = router

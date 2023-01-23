const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const { authMiddleware } = require('~/middlewares/auth')
const setCurrentUserId = require('~/middlewares/setCurrentUserId')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const studentController = require('~/controllers/student')

const router = express.Router()

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/my-profile', setCurrentUserId, asyncWrapper(studentController.getStudentById))

router.get('/', asyncWrapper(studentController.getStudents))
router.get('/:id', asyncWrapper(studentController.getStudentById))
router.patch('/:id', asyncWrapper(studentController.updateStudent))
router.delete('/:id', asyncWrapper(studentController.deleteStudent))

module.exports = router

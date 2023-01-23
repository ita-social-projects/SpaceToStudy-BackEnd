const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const setCurrentUserId = require('~/middlewares/setCurrentUserId')
const studentController = require('~/controllers/student')
const { authMiddleware } = require('~/middlewares/auth')

const router = express.Router()

router.param('id', idValidation)

router.use(authMiddleware)

router.get('/my-profile', setCurrentUserId, asyncWrapper(studentController.getStudentById))

router.get('/', asyncWrapper(studentController.getStudents))
router.get('/:id', asyncWrapper(studentController.getStudentById))
router.patch('/:id', asyncWrapper(studentController.updateStudent))
router.delete('/:id', asyncWrapper(studentController.deleteStudent))

module.exports = router

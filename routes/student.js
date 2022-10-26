const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const studentController = require('~/controllers/student')

const router = express.Router()

router.param('id', idValidation)

router.post('/', asyncWrapper(studentController.addStudent))
router.get('/', asyncWrapper(studentController.getStudents))
router.get('/:id', asyncWrapper(studentController.getStudentById))
router.patch('/:id', asyncWrapper(studentController.updateStudent))
router.delete('/:id', asyncWrapper(studentController.deleteStudent))

module.exports = router

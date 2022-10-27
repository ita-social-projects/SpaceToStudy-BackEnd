const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const tutorController = require('~/controllers/tutor')

const router = express.Router()

router.param('id', idValidation)

router.get('/', asyncWrapper(tutorController.getTutors))
router.get('/:id', asyncWrapper(tutorController.getTutorById))
router.patch('/:id', asyncWrapper(tutorController.updateTutor))
router.delete('/:id', asyncWrapper(tutorController.deleteTutor))

module.exports = router

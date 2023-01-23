const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const { authMiddleware } = require('~/middlewares/auth')
const setCurrentUserId = require('~/middlewares/setCurrentUserId')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const tutorController = require('~/controllers/tutor')

const router = express.Router()

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/my-profile', setCurrentUserId, asyncWrapper(tutorController.getTutorById))

router.get('/', asyncWrapper(tutorController.getTutors))
router.get('/:id', asyncWrapper(tutorController.getTutorById))
router.patch('/:id', asyncWrapper(tutorController.updateTutor))
router.delete('/:id', asyncWrapper(tutorController.deleteTutor))

module.exports = router

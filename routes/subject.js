const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const subjectController = require('~/controllers/subject')
const { authMiddleware } = require('~/middlewares/auth')

const router = express.Router()

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/', asyncWrapper(subjectController.getSubjects))
router.post('/', asyncWrapper(subjectController.addSubject))
router.get('/:id', asyncWrapper(subjectController.getSubjectById))
router.patch('/:id', asyncWrapper(subjectController.updateSubject))
router.delete('/:id', asyncWrapper(subjectController.deleteSubject))

module.exports = router

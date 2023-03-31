const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const subjectController = require('~/controllers/subject')
const Subject = require('~/models/subject')

const router = express.Router({ mergeParams: true })

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/names', asyncWrapper(subjectController.getNamesByCategoryId))

router.get('/', asyncWrapper(subjectController.getSubjects))
router.post('/', asyncWrapper(subjectController.addSubject))
router.get('/:id', isEntityValid([{ model: Subject, idName: 'id' }]), asyncWrapper(subjectController.getSubjectById))
router.patch('/:id', isEntityValid([{ model: Subject, idName: 'id' }]), asyncWrapper(subjectController.updateSubject))
router.delete('/:id', isEntityValid([{ model: Subject, idName: 'id' }]), asyncWrapper(subjectController.deleteSubject))

module.exports = router

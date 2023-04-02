const router = require('express').Router({ mergeParams: true })

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')

const subjectController = require('~/controllers/subject')
const Category = require('~/models/category')
const Subject = require('~/models/subject')

const body = [{ model: Category, idName: 'category' }]
const param = [{ model: Subject, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.get('/names', asyncWrapper(subjectController.getNamesByCategoryId))

router.get('/', asyncWrapper(subjectController.getSubjects))
router.post('/', isEntityValid(body, 'body'), asyncWrapper(subjectController.addSubject))
router.get('/:id', isEntityValid(param), asyncWrapper(subjectController.getSubjectById))
router.patch('/:id', isEntityValid(param), asyncWrapper(subjectController.updateSubject))
router.delete('/:id', isEntityValid(param), asyncWrapper(subjectController.deleteSubject))

module.exports = router

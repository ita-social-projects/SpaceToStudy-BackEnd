const router = require('express').Router({ mergeParams: true })

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, ownershipMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')
const validationMiddleware = require('~/middlewares/validation')

const noteRouter = require('~/routes/note')

const cooperationController = require('~/controllers/cooperation')
const Offer = require('~/models/offer')
const Cooperation = require('~/models/cooperation')
const { updateResourceCompletionStatusValidationSchema } = require('~/validation/schemas/cooperation')

const { ownerFields } = require('~/consts/auth')

const body = [{ model: Offer, idName: 'offer' }]
const params = [{ model: Cooperation, idName: 'id' }]

router.use(authMiddleware)

router.param('id', idValidation)

router.use('/:id/notes', noteRouter)

router.get('/', asyncWrapper(cooperationController.getCooperations))
router.post('/', isEntityValid({ body }), asyncWrapper(cooperationController.createCooperation))
router.use('/:id', isEntityValid({ params }), asyncWrapper(ownershipMiddleware(Cooperation, ownerFields)))
router.get('/:id', asyncWrapper(cooperationController.getCooperationById))
router.patch('/:id', asyncWrapper(cooperationController.updateCooperation))
router.patch(
  '/:id/:resourceId/completionStatus',
  isEntityValid({ params }),
  validationMiddleware(updateResourceCompletionStatusValidationSchema),
  asyncWrapper(cooperationController.updateResourceCompletionStatus)
)

module.exports = router

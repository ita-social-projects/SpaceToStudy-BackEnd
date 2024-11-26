const router = require('express').Router()
const Attachment = require('~/models/attachment')
const upload = require('~/middlewares/multer')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const idValidation = require('~/middlewares/idValidation')
const isEntityValid = require('~/middlewares/entityValidation')
const attachmentController = require('~/controllers/attachment')
const { authMiddleware, restrictTo, ownershipMiddleware } = require('~/middlewares/auth')
const {
  MODEL_CONFIGS: { CooperationModel }
} = require('~/consts/modelPath')
const {
  ownerFields,
  roles: { TUTOR }
} = require('~/consts/auth')

const params = [{ model: Attachment, idName: 'id' }]

router.use(authMiddleware)
router.use(restrictTo(TUTOR))
router.param('id', idValidation)

router.get('/', asyncWrapper(attachmentController.getAttachments))
router.post('/', upload.array('files'), asyncWrapper(attachmentController.createAttachments))
router.use(
  '/:id',
  isEntityValid({ params }),
  asyncWrapper(ownershipMiddleware(Attachment, ownerFields, CooperationModel))
)
router.patch('/:id', asyncWrapper(attachmentController.updateAttachment))
router.delete('/:id', asyncWrapper(attachmentController.deleteAttachment))

module.exports = router

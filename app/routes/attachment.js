const router = require('express').Router()
const Attachment = require('~/app/models/attachment')
const upload = require('~/app/middlewares/multer')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const idValidation = require('~/app/middlewares/idValidation')
const isEntityValid = require('~/app/middlewares/entityValidation')
const attachmentController = require('~/app/controllers/attachment')
const { authMiddleware, restrictTo } = require('~/app/middlewares/auth')
const {
  roles: { TUTOR }
} = require('~/app/consts/auth')

const params = [{ model: Attachment, idName: 'id' }]

router.use(authMiddleware)
router.use(restrictTo(TUTOR))
router.param('id', idValidation)

router.get('/', asyncWrapper(attachmentController.getAttachments))
router.post('/', upload.array('files'), asyncWrapper(attachmentController.createAttachments))
router.patch('/:id', isEntityValid({ params }), asyncWrapper(attachmentController.updateAttachment))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(attachmentController.deleteAttachment))

module.exports = router

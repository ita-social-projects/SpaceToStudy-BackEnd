const router = require('express').Router()
const Attachment = require('~/models/attachment')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const idValidation = require('~/middlewares/idValidation')
const isEntityValid = require('~/middlewares/entityValidation')
const attachmentController = require('~/controllers/attachment')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

const params = [{ model: Attachment, idName: 'id' }]

router.use(authMiddleware)
router.use(restrictTo(TUTOR))
router.param('id', idValidation)

router.get('/', asyncWrapper(attachmentController.getAttachments))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(attachmentController.deleteAttachment))

module.exports = router

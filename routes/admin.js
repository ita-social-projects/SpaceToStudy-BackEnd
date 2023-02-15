const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const adminController = require('~/controllers/admin')

const router = express.Router()

router.param('id', idValidation)

router.get('/', asyncWrapper(adminController.getAdmins))
router.get('/:id', asyncWrapper(adminController.getAdminById))
router.patch('/:id', asyncWrapper(adminController.updateAdmin))
router.patch('/:id/block', asyncWrapper(adminController.blockAdmin))
router.patch('/:id/unblock', asyncWrapper(adminController.unblockAdmin))
router.delete('/:id', asyncWrapper(adminController.deleteAdmin))

module.exports = router

const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const adminController = require('~/controllers/admin')

const router = express.Router()

router.param('id', idValidation)

router.post('/', asyncWrapper(adminController.addAdmin))
router.get('/', asyncWrapper(adminController.getAdmins))
router.get('/:id', asyncWrapper(adminController.getAdminById))
router.patch('/:id', asyncWrapper(adminController.updateAdmin))
router.delete('/:id', asyncWrapper(adminController.deleteAdmin))

module.exports = router

const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const isEntityValid = (entities) => {
  return async (req, _res, next) => {
    const models = []

    let id = null

    if (entities.params) {
      for ( const { model, idName } of entities.params) {
        id = req.body[idName]
          
        if (!id) continue

        const document = await model.findById(id)

        if (!document) {
          models.push(model.modelName)
        }
      }
    }

    if (entities.body) {
      for ( const { model, idName } of entities.params) {
        id = req.body[idName]
          
        if (!id) continue

        const document = await model.findById(id)

        if (!document) {
          models.push(model.modelName)
        }
      }
    }

    if (models.length > 0) {
      next(createError(404, DOCUMENT_NOT_FOUND(models)))
    }

    next()
  }
}

module.exports = isEntityValid

const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const isEntityValid = (entities, idSource = 'params') => {
  return async (req, res, next) => {
    const models = []

    for (const { model, idName } of entities) {
      let id = null

      if (idSource === 'params') {
        id = req.params[idName]
      }

      if (idSource === 'body') {
        id = req.body[idName]
      }

      if (!id) continue

      const document = await model.findById(id)

      if (!document) {
        models.push(model.modelName)
      }
    }

    if (models.length > 0) {
      next(createError(404, DOCUMENT_NOT_FOUND(models)))
    }

    next()
  }
}

module.exports = isEntityValid

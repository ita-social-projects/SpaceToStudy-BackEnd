const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const isEntityValid = (entities, idSource = 'params') => {
  return async (req, res, next) => {
    const models = await entities.reduce(async (accPromise, { model, idName }) => {
      const acc = await accPromise
      let id = null

      if (idSource === 'params') {
        id = req.params[idName]
      }

      if (idSource === 'body') {
        id = req.body[idName]
      }

      if (!id) {
        return acc
      }

      const document = await model.findById(id)

      if (!document) {
        const modelName = model.modelName
        return [...acc, modelName]
      }

      return acc
    }, [])

    if (models.length > 0) {
      next(createError(404, DOCUMENT_NOT_FOUND(models)))
    }

    next()
  }
}

module.exports = isEntityValid

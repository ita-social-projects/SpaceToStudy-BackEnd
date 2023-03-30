const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const isEntityValid = (entities) => {
  return async (req, res, next) => {
    if (!req.params) next()

    for (const { model, idName } of entities) {
      const id = req.params[idName]

      if (id) {
        console.log('model', model)
        console.log('modelName', model.modelName)
        const document = await model.findById(id)
        if (!document) {
          next(createError(404, DOCUMENT_NOT_FOUND(model.modelName)))
        }
      }
    }

    next()
  }
}
module.exports = isEntityValid

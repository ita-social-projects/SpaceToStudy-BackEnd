const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const isEntityValid = (entities) => {
  return async (req, _res, next) => {
    const models = []

    let id = null

    if (entities.params?.length) {
      for (const { model, idName } of entities.params) {
        id = req.params[idName]

        if (!id) continue

        const document = await model.findById(id)

        if (!document) {
          if (!models.includes(model.modelName)) models.push(model.modelName)
        }
      }
    }

    if (entities.body?.length) {
      for (const { model, idName } of entities.body) {
        id = req.body[idName]

        if (!id) continue

        const document = await model.findById(id)

        if (!document) {
          if (!models.includes(model.modelName)) models.push(model.modelName)
        }
      }
    }

    if (models.length) {
      next(createError(404, DOCUMENT_NOT_FOUND(models)))
    }

    next()
  }
}

module.exports = isEntityValid

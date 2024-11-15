const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const validateSingleEntity = async (id, model, models) => {
  if (!id) {
    return
  }

  const document = await model.findById(id)

  if (!document && !models.includes(model.modelName)) {
    models.push(model.modelName)
  }
}

const isEntityValid = (entities) => {
  return async (req, _res, next) => {
    const models = []

    let id = null

    if (entities.params?.length) {
      for (const { model, idName } of entities.params) {
        id = req.params[idName]

        await validateSingleEntity(id, model, models)
      }
    }

    if (entities.body?.length) {
      for (const { model, idName } of entities.body) {
        if (Array.isArray(req.body[idName])) {
          await Promise.all(
            req.body[idName].map(async (id) => {
              const document = await model.findById(id)

              if (!document && !models.includes(model.modelName)) {
                models.push(model.modelName)
              }
            })
          )
        } else {
          id = req.body[idName]

          await validateSingleEntity(id, model, models)
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

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

const validateEntitiesFromParams = async (params, req, models) => {
  if (params?.length) {
    for (const { model, idName } of params) {
      const id = req.params[idName]

      await validateSingleEntity(id, model, models)
    }
  }
}

const validateEntitiesFromBody = async (body, req, models) => {
  if (body?.length) {
    for (const { model, idName } of body) {
      if (Array.isArray(req.body[idName])) {
        await Promise.all(
          req.body[idName].map(async (id) => {
            await validateSingleEntity(id, model, models)
          })
        )
      } else {
        const id = req.body[idName]
        await validateSingleEntity(id, model, models)
      }
    }
  }
}

const isEntityValid = (entities) => {
  return async (req, _res, next) => {
    const models = []

    await validateEntitiesFromParams(entities.params, req, models)

    await validateEntitiesFromBody(entities.body, req, models)

    if (models.length) {
      next(createError(404, DOCUMENT_NOT_FOUND(models)))
    }

    next()
  }
}

module.exports = isEntityValid

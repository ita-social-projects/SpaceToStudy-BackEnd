const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')

const createEntityValidator = (invalidModels) => {
  return async (id, model) => {
    if (!id) {
      return
    }

    const document = await model.findById(id)

    if (!document && !invalidModels.includes(model.modelName)) {
      invalidModels.push(model.modelName)
    }
  }
}

const validateEntitiesFromParams = async (entitiesParams, reqParams, validateSingleEntity) => {
  if (!entitiesParams?.length) {
    return
  }

  for (const { model, idName } of entitiesParams) {
    const id = reqParams[idName]

    await validateSingleEntity(id, model)
  }
}

const validateEntitiesFromBody = async (entitiesBody, reqBody, validateSingleEntity) => {
  if (!entitiesBody?.length) {
    return
  }

  for (const { model, idName } of entitiesBody) {
    if (Array.isArray(reqBody[idName])) {
      await Promise.all(
        reqBody[idName].map(async (id) => {
          await validateSingleEntity(id, model)
        })
      )
      return
    }

    const id = reqBody[idName]
    await validateSingleEntity(id, model)
  }
}

const isEntityValid = (entities) => {
  return async (req, _res, next) => {
    const invalidModels = []

    await validateEntitiesFromParams(entities.params, req.params, createEntityValidator(invalidModels))

    await validateEntitiesFromBody(entities.body, req.body, createEntityValidator(invalidModels))

    if (invalidModels.length) {
      next(createError(404, DOCUMENT_NOT_FOUND(invalidModels)))
    }

    next()
  }
}

module.exports = isEntityValid

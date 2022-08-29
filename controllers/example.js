const Example = require('~/models/example')
const { createError } = require('~/utils/errorsHelper')
const { EXAMPLE_NOT_FOUND } = require('~/consts/errors')

exports.getExample = async (req, res) => {
  const items = await Example.find()
  res.status(200).json({
    items: items
  })
}

exports.postExample = async (req, res) => {
  const { title } = req.body
  const example = new Example({
    title: title
  })

  const savedExample = await example.save()
  res.status(201).json({
    item: savedExample
  })
}

exports.deleteExample = async (req, res) => {
  const exampleId = req.params.exampleId

  const example = await Example.findByIdAndRemove(exampleId)
  if (!example) {
    throw createError(404, EXAMPLE_NOT_FOUND)
  }

  res.status(204).end()
}

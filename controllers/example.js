const Example = require('~/models/example')

exports.getExample = async (req, res) => {
  try {
    const items = await Example.find()
    res.status(200).json({
      items: items
    })
  } catch (err) {
    console.log(err)
  }
}

exports.postExample = async (req, res) => {
  const { title } = req.body
  const example = new Example({
    title: title
  })
  
  try {
    const savedExample = await example.save()
    res.status(201).json({
      item: savedExample
    })
  } catch (err) {
    console.log(err)
  }
}

exports.deleteExample = async (req, res) => {
  const exampleId = req.params.exampleId
  try {
    const example = await Example.findById(exampleId)
    
    if (!example) {
      const error = new Error('Could not find example.')
      error.statusCode = 404
      throw error
    }

    await Example.findByIdAndRemove(exampleId)

    res.status(200).json({ message: 'Example deleted.' })
  } catch (e) {
    console.log(e)
  }
}
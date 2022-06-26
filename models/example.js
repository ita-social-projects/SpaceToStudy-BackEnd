const { Schema, model } = require('mongoose')

const exampleSchema = new Schema({
  title: {
    type: String,
    required: true
  }
})

module.exports = model('Example', exampleSchema)

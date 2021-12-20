const mongoose = require('mongoose')
const Schema = mongoose.Schema

const exampleSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    }
  }
)

module.exports = mongoose.model('Example', exampleSchema)

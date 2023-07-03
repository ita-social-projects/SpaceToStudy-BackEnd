const lessonService = require('~/services/lesson')

const createLesson = async (req, res) => {
  const data = req.body
  console.log(data)

  const newLesson = lessonService.createLesson(data)

  res.status(201).send(newLesson)
}

module.exports = {
  createLesson
}

const coursesAndCooperationsService = require('~/services/coursesCooperations')

const getCoursesAndCooperationsByResourseId = async (req, res) => {
  const coursesAndCooperations = await coursesAndCooperationsService.getCoursesAndCooperationsByResourseId(
    req.params.resourceId,
    req.user.id
  )

  res.status(200).json(coursesAndCooperations)
}

module.exports = { getCoursesAndCooperationsByResourseId }

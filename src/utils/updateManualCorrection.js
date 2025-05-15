const applyManualCorrection = (finishedQuiz, questionText, newIsCorrect) => {
  finishedQuiz.results = finishedQuiz.results.map((result) => {
    if (result.question === questionText) {
      return {
        ...result,
        answers: result.answers.map((answer) => ({
          ...answer,
          isCorrect: newIsCorrect,
          isChosen: true
        }))
      }
    }
    return result
  })

  const answeredResults = finishedQuiz.results.filter((result) => result.answers.length > 0)

  const totalQuestions = answeredResults.length
  const correctAnswers = answeredResults.reduce((sum, result) => {
    return sum + (result.answers.some((answer) => answer.isCorrect) ? 1 : 0)
  }, 0)

  finishedQuiz.grade = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100)
}

module.exports = applyManualCorrection

const Quiz = 

async function create(req, res, next) {
  try {
    const { title, summary, featured_image } = req.body;
    const newQuiz = await Quiz.

  } catch (error) {
    next(error)
  }
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!options.some(o => o.is_correct)) {
    alert('Please mark at least one option as correct.')
    return
  }

  const questionData = {
    quiz_id: quizId,
    text,
    explanation,
    difficulty,
    order_index: questions.length + 1,
  }

  let questionId: string
  if (editingQ) {
    await supabase
      .from('questions')
      .update(questionData)
      .eq('id', editingQ.id)
    questionId = editingQ.id
    await supabase.from('options').delete().eq('question_id', editingQ.id)
  } else {
    const { data, error } = await supabase
      .from('questions')
      .insert(questionData)
      .select('id')
      .single()
    if (error || !data) {
      console.error('Error creating question:', error)
      alert('Failed to create question.')
      return
    }
    questionId = data.id
  }

  // Insert options
  const optionsToInsert = options.map(opt => ({
    question_id: questionId,
    text: opt.text,
    is_correct: opt.is_correct,
    letter: opt.letter,
  }))
  await supabase.from('options').insert(optionsToInsert)

  // Update question count in quiz
  const { count } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('quiz_id', quizId)
  await supabase
    .from('quizzes')
    .update({ questions_count: count || 0 })
    .eq('id', quizId)

  resetForm()
  fetchQuestions()
}
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

interface Option {
  id?: string
  text: string
  is_correct: boolean
  letter: string
}

interface Question {
  id: string
  text: string
  explanation: string
  difficulty: string
  order_index: number
  options: Option[]
}

export default function ManageQuestions() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [quizTitle, setQuizTitle] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingQ, setEditingQ] = useState<Question | null>(null)

  // Form state
  const [text, setText] = useState('')
  const [explanation, setExplanation] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [options, setOptions] = useState<Option[]>([
    { text: '', is_correct: false, letter: 'A' },
    { text: '', is_correct: false, letter: 'B' },
    { text: '', is_correct: false, letter: 'C' },
    { text: '', is_correct: false, letter: 'D' },
  ])

  useEffect(() => {
    if (quizId) {
      fetchQuizDetails()
      fetchQuestions()
    }
  }, [quizId])

  const fetchQuizDetails = async () => {
    const { data } = await supabase
      .from('quizzes')
      .select('title')
      .eq('id', quizId)
      .single()
    if (data) setQuizTitle(data.title)
  }

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('questions')
      .select(`
        id,
        text,
        explanation,
        difficulty,
        order_index,
        options ( id, text, is_correct, letter )
      `)
      .eq('quiz_id', quizId)
      .order('order_index')

    if (data) {
      const formatted = data.map((q: any) => ({
        ...q,
        options: q.options || []
      }))
      setQuestions(formatted)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate at least one correct option
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
      // Delete existing options
      await supabase.from('options').delete().eq('question_id', editingQ.id)
    } else {
      const { data } = await supabase
        .from('questions')
        .insert(questionData)
        .select('id')
        .single()
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
      .update({ questions_count: count })
      .eq('id', quizId)

    resetForm()
    fetchQuestions()
  }

  const resetForm = () => {
    setText('')
    setExplanation('')
    setDifficulty('Medium')
    setOptions([
      { text: '', is_correct: false, letter: 'A' },
      { text: '', is_correct: false, letter: 'B' },
      { text: '', is_correct: false, letter: 'C' },
      { text: '', is_correct: false, letter: 'D' },
    ])
    setEditingQ(null)
    setShowForm(false)
  }

  const editQuestion = (q: Question) => {
    setEditingQ(q)
    setText(q.text)
    setExplanation(q.explanation || '')
    setDifficulty(q.difficulty)
    setOptions(q.options.map(o => ({ ...o })) || [
      { text: '', is_correct: false, letter: 'A' },
      { text: '', is_correct: false, letter: 'B' },
      { text: '', is_correct: false, letter: 'C' },
      { text: '', is_correct: false, letter: 'D' },
    ])
    setShowForm(true)
  }

  const deleteQuestion = async (id: string) => {
    if (confirm('Delete this question?')) {
      await supabase.from('questions').delete().eq('id', id)
      fetchQuestions()
    }
  }

  const updateOption = (index: number, field: keyof Option, value: string | boolean) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Questions</h1>
            <p className="text-gray-500">Quiz: {quizTitle}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/quizzes')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              ← Back
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Question
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingQ ? 'Edit Question' : 'Add Question'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Question Text *</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Explanation</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options (mark correct answer)</label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3 mb-2">
                    <span className="w-6 font-bold">{opt.letter}.</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOption(idx, 'text', e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2"
                      placeholder={`Option ${opt.letter}`}
                      required
                    />
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={opt.is_correct}
                        onChange={(e) => updateOption(idx, 'is_correct', e.target.checked)}
                        className="h-4 w-4"
                      />
                      Correct
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  {editingQ ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {questions.length === 0 ? (
            <p className="p-6 text-gray-500">No questions yet. Add your first question!</p>
          ) : (
            <div className="divide-y">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{idx+1}. {q.text}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Difficulty: {q.difficulty} • {q.options.filter(o => o.is_correct).length} correct answer(s)
                      </p>
                      {q.explanation && <p className="text-sm text-gray-600 mt-1">💡 {q.explanation}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {q.options.map((opt) => (
                          <span key={opt.id} className={`text-xs px-2 py-1 rounded-full ${opt.is_correct ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {opt.letter}: {opt.text}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editQuestion(q)} className="text-blue-600 hover:underline text-sm">Edit</button>
                      <button onClick={() => deleteQuestion(q.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

interface Quiz {
  id: string
  title: string
  description: string
  category_id: string
  difficulty: string
  time_limit: number
  questions_count: number
  status: string
  is_daily: boolean
}

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const navigate = useNavigate()

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [timeLimit, setTimeLimit] = useState(10)
  const [status, setStatus] = useState('draft')
  const [isDaily, setIsDaily] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetchQuizzes()
    fetchCategories()
  }, [])

  const fetchQuizzes = async () => {
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
    setQuizzes(data || [])
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
    setCategories(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const quizData = {
      title,
      description,
      category_id: categoryId,
      difficulty,
      time_limit: timeLimit,
      status,
      is_daily: isDaily,
      questions_count: 0,
    }

    if (editingQuiz) {
      await supabase
        .from('quizzes')
        .update(quizData)
        .eq('id', editingQuiz.id)
    } else {
      await supabase
        .from('quizzes')
        .insert(quizData)
    }

    resetForm()
    fetchQuizzes()
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategoryId('')
    setDifficulty('Medium')
    setTimeLimit(10)
    setStatus('draft')
    setIsDaily(false)
    setEditingQuiz(null)
    setShowForm(false)
  }

  const editQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setTitle(quiz.title)
    setDescription(quiz.description || '')
    setCategoryId(quiz.category_id)
    setDifficulty(quiz.difficulty)
    setTimeLimit(quiz.time_limit)
    setStatus(quiz.status)
    setIsDaily(quiz.is_daily || false)
    setShowForm(true)
  }

  const deleteQuiz = async (id: string) => {
    if (confirm('Delete this quiz?')) {
      await supabase.from('quizzes').delete().eq('id', id)
      fetchQuizzes()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Quizzes</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Quiz
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingQuiz ? 'Edit Quiz' : 'Create Quiz'}
            </h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700">Time Limit (min)</label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isDaily}
                  onChange={(e) => setIsDaily(e.target.checked)}
                  className="h-4 w-4"
                />
                <label className="text-sm font-medium text-gray-700">Set as Daily Quiz</label>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  {editingQuiz ? 'Update' : 'Create'}
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
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">Title</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Difficulty</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Qs</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-t">
                  <td className="px-4 py-3 text-sm">{quiz.title}</td>
                  <td className="px-4 py-3 text-sm">{quiz.difficulty}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${quiz.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{quiz.questions_count}</td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <button
                      onClick={() => editQuiz(quiz)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/admin/quiz/${quiz.id}/questions`)}
                      className="text-green-600 hover:underline text-sm"
                    >
                      Questions
                    </button>
                    <button
                      onClick={() => deleteQuiz(quiz.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
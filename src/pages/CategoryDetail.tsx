import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Clock, BookOpen, ChevronRight } from 'lucide-react'

interface Quiz {
  id: string
  title: string
  description: string
  difficulty: string
  time_limit: number
  questions_count: number
}

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch category
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()
      setCategory(catData)

      // Fetch quizzes in this category
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('category_id', catData?.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      setQuizzes(quizData || [])
      setLoading(false)
    }
    fetchData()
  }, [slug])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!category) return <div className="min-h-screen flex items-center justify-center">Category not found.</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
          <p className="text-gray-500">{category.description}</p>
          <p className="text-sm text-gray-400 mt-1">{quizzes.length} quizzes available</p>
        </div>

        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              to={`/quiz/${quiz.id}`}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{quiz.title}</h3>
                <p className="text-sm text-gray-500">{quiz.difficulty || 'Medium'} • {quiz.questions_count || 0} questions • {quiz.time_limit || 5} min</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
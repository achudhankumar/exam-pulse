import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { BookOpen } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  quiz_count: number
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          quizzes:quizzes(count)
        `)
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        setLoading(false)
        return
      }

      if (data) {
        const formatted = data.map((cat: any) => ({
          ...cat,
          quiz_count: cat.quizzes ? cat.quizzes[0]?.count || 0 : 0
        }))
        setCategories(formatted)
      }
      setLoading(false)
    }
    fetchCategories()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📚 Categories</h1>
        <p className="text-gray-500 mb-6">Browse quizzes by subject.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{cat.description || 'Practice quizzes'}</p>
                  <p className="text-sm text-blue-600 mt-2">{cat.quiz_count} quizzes</p>
                </div>
                <BookOpen className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
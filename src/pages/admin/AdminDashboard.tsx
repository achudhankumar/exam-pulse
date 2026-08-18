import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Users, BookOpen, Award, Edit, PlusCircle, BarChart } from 'lucide-react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        navigate('/dashboard')
        return
      }
      setIsAdmin(true)
      setLoading(false)
    }
    checkAdmin()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) return null

  const stats = [
    { label: 'Total Users', value: '1', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Quizzes', value: '0', icon: BookOpen, color: 'bg-green-100 text-green-600' },
    { label: 'Total Questions', value: '0', icon: Award, color: 'bg-purple-100 text-purple-600' },
  ]

  const actions = [
    { label: 'Manage Categories', path: '/admin/categories', icon: Edit },
    { label: 'Create Quiz', path: '/admin/quiz/new', icon: PlusCircle },
    { label: 'Manage Questions', path: '/admin/questions', icon: BarChart },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-6">Manage your quiz platform.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action, idx) => {
            const Icon = action.icon
            return (
              <Link
                key={idx}
                to={action.path}
                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition flex items-center gap-3"
              >
                <Icon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-700">{action.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}